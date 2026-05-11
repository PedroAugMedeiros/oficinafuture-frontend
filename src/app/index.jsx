import { colors } from './styles/colors.js';
import Card from '../components/Card.jsx';
import Header from '../components/Header';
import CUSTOMERS from '../icons/CUSTOMERS.svg';
import EMANDAMENTO from '../icons/EMANDAMENTO.svg';
import HISTORY from '../icons/HISTORY.svg';
import MAISUSADO from '../icons/MAISUSADO.svg';
import OFFESTOQUE from '../icons/OFFESTOQUE.svg';
import OSCLOSE from '../icons/OSCLOSE.svg';
import OSOPEN from '../icons/OSOPEN.svg';
import SUPPLIERS from '../icons/SUPPLIERS.svg';
import estoqueBanner from '../images/estoqueBanner.png';
import osBanner from '../images/osBanner.png';
import pessoasBanner from '../images/pessoasBanner.png';
import veiculosBanner from '../images/veiculosBanner.png';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import cards from './services/cards.json';

const bannerMap = {
  estoqueBanner,
  osBanner,
  pessoasBanner,
  veiculosBanner,
};

const iconMap = {
  CUSTOMERS,
  EMANDAMENTO,
  HISTORY,
  MAISUSADO,
  OFFESTOQUE,
  OSCLOSE,
  OSOPEN,
  SUPPLIERS,
};

export default function Home() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            banner={bannerMap[card.bannerKey]}
            icon={card.iconKeys.map((iconKey) => iconMap[iconKey])}
            shortcut={card.shortcut}
            targetScreen={card.route}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
