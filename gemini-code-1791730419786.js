import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  // Solicita permissão de câmera no emulador
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleStartCounting = () => {
    if (hasPermission) {
      setCurrentScreen('Camera');
    } else {
      Alert.alert("Aviso", "Aguardando permissão da câmera.");
    }
  };

  // Simulação de gravação e envio (Mock para o teste visual online)
  const startRecording = () => {
    setIsRecording(true);
    
    // Finge que está gravando por 3 segundos e depois para
    setTimeout(() => {
       stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    uploadVideo();
  };

  const uploadVideo = () => {
    setIsProcessing(true);
    setCurrentScreen('Processing');
    
    // Finge que a API na nuvem está processando por 3 segundos
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        "Contagem Concluída",
        "Total de suínos: 42\n(Humanos ignorados na contagem)",
        [{ text: "OK, Voltar ao Início", onPress: () => setCurrentScreen('Home') }]
      );
    }, 3000);
  };

  // ================= TELA HOME =================
  if (currentScreen === 'Home') {
    return (
      <SafeAreaView style={styles.homeContainer}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Agro IA</Text>
          <Text style={styles.appSubtitle}>Contador de Suínos</Text>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.instructionText}>
            Para testar, posicione-se em um local onde os animais passem por um corredor.
            Quando estiver pronto, clique no botão abaixo para iniciar a gravação.
          </Text>
        </View>

        {/* Botão fixado no rodapé */}
        <View style={styles.fixedBottomContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartCounting}>
            <Text style={styles.primaryButtonText}>INICIAR APLICATIVO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ================= TELA DE PROCESSAMENTO =================
  if (currentScreen === 'Processing') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingTitle}>Analisando o lote...</Text>
        <Text style={styles.loadingSubText}>Nossa IA está calculando a passagem pelo corredor...</Text>
      </View>
    );
  }

  // ================= TELA DA CÂMERA =================
  return (
    <View style={styles.cameraContainer}>
      <Camera style={styles.camera} type={CameraType.back} ref={cameraRef}>
        
        <View style={styles.cameraHeader}>
           <TouchableOpacity onPress={() => setCurrentScreen('Home')} style={styles.cancelButton}>
             <Text style={styles.cancelText}>Cancelar</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.guideLineContainer}>
           <View style={styles.guideLine} />
           <Text style={styles.guideText}>Mantenha a linha no centro da passagem</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? null : startRecording}
          >
            <Text style={styles.recordText}>
              {isRecording ? 'Gravando e Analisando...' : 'Gravar Passagem'}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

// ================= ESTILOS =================
const styles = StyleSheet.create({
  homeContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  appTitle: { fontSize: 34, fontWeight: 'bold', color: '#2C3E50' },
  appSubtitle: { fontSize: 18, color: '#7F8C8D', marginTop: 5 },
  mainContent: { paddingHorizontal: 30, alignItems: 'center' },
  instructionText: { fontSize: 16, textAlign: 'center', color: '#34495E', lineHeight: 24 },
  
  fixedBottomContainer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  primaryButton: { backgroundColor: '#27AE60', paddingVertical: 20, borderRadius: 12, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
  primaryButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  cameraHeader: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  cancelButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5 },
  cancelText: { color: 'white', fontSize: 16 },
  buttonContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 },
  recordButton: { backgroundColor: '#3498DB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  recordButtonActive: { backgroundColor: '#E74C3C' },
  recordText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  guideLineContainer: { position: 'absolute', top: '50%', width: '100%', alignItems: 'center' },
  guideLine: { width: '100%', height: 3, backgroundColor: 'rgba(46, 204, 113, 0.8)' },
  guideText: { color: 'white', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 5, fontSize: 14 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2C3E50' },
  loadingTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  loadingSubText: { color: '#BDC3C7', fontSize: 16, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 },
});