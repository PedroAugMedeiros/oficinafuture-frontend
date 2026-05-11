import { shareAsync } from 'expo-sharing';
import { Alert, Button, Platform, StyleSheet, View } from 'react-native';
import { printOrder, printOrderToFile } from '../utils/printOrder';

const SAMPLE_ORDER = {
  osId: 999,
  title: 'Teste de impressao',
  client: 'Cliente de teste',
  status: 'ABERTA',
  createdAt: Date.now(),
  image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc',
};

export default function Test({ order = SAMPLE_ORDER }) {
  const handlePrint = async () => {
    try {
      await printOrder(order);
    } catch (error) {
      Alert.alert(
        'Erro ao imprimir',
        error?.message || 'Nao foi possivel abrir a impressao da OS.'
      );
    }
  };

  const handlePrintToFile = async () => {
    try {
      const file = await printOrderToFile(order);

      if (!file?.uri) {
        return;
      }

      await shareAsync(file.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch (error) {
      Alert.alert(
        'Erro ao gerar PDF',
        error?.message || 'Nao foi possivel gerar o PDF da OS.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Imprimir teste da OS" onPress={handlePrint} />
      <View style={styles.spacer} />
      <Button
        title={Platform.OS === 'web' ? 'Abrir para salvar em PDF' : 'Gerar PDF da OS'}
        onPress={handlePrintToFile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  spacer: {
    height: 8,
  },
});