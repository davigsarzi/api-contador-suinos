from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import os
import cv2
from ultralytics import YOLO
import uuid

app = FastAPI(title="API - Contador de Suínos")

model = YOLO("yolov8n.pt") 

LINHA_Y = 400 
CLASSE_PESSOA = 0
CLASSE_ANIMAL = 19 

TEMP_DIR = "temp_videos"
os.makedirs(TEMP_DIR, exist_ok=True)

def processar_video_yolo(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    animais_contados = set()
    total_animais = 0
    pessoas_ignoradas = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success: break

        results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            classes = results[0].boxes.cls.int().cpu().tolist()

            for box, track_id, cls in zip(boxes, track_ids, classes):
                x1, y1, x2, y2 = map(int, box)

                if cls == CLASSE_PESSOA:
                    pessoas_ignoradas += 1
                    continue

                if cls == CLASSE_ANIMAL:
                    centro_y = int((y1 + y2) / 2)
                    if centro_y > LINHA_Y and track_id not in animais_contados:
                        animais_contados.add(track_id)
                        total_animais += 1

    cap.release()
    return {
        "status": "sucesso",
        "suinos_contados": total_animais,
        "registros_unicos_identificados": len(animais_contados),
        "pessoas_detectadas": pessoas_ignoradas > 0
    }

@app.post("/contar_suinos/")
async def receber_video(file: UploadFile = File(...)):
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
        return JSONResponse(status_code=400, content={"erro": "Formato não suportado."})

    file_id = str(uuid.uuid4())
    temp_file_path = os.path.join(TEMP_DIR, f"{file_id}_{file.filename}")

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        resultado = processar_video_yolo(temp_file_path)
        return resultado
    except Exception as e:
        return JSONResponse(status_code=500, content={"erro": str(e)})
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/")
def home():
    return {"mensagem": "API do Contador de Suinos esta online!"}
