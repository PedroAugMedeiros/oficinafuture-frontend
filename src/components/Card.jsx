import { useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../app/styles/colors';

const LEGACY_ROUTE_MAP = {
  Test: '/TestScreen',
  TestOS: '/TestOS',
  TestPRODUCTS: '/TestPRODUCTS',
  TESTVEICULOS: '/TESTVEICULOS',
  PEOPLESCREEN: '/TestScreen',
  PRODUCTSSCREEN: '/TestPRODUCTS',
  VEICULOSSCREEN: '/TESTVEICULOS',
};

function resolveRoutePath(targetScreen) {
  if (!targetScreen) return null;
  if (targetScreen.startsWith('/')) return targetScreen;

  return LEGACY_ROUTE_MAP[targetScreen] ?? `/${targetScreen}`;
}

export default function Card(props) {
  const { title, banner, icon, shortcut, targetScreen } = props;
  const router = useRouter();
  const routePath = resolveRoutePath(targetScreen);

  const handleNavigate = (selectedShortcut) => {
    if (!routePath) {
      Alert.alert('Rota indisponivel', 'Esta tela ainda nao foi configurada.');
      return;
    }

    if (selectedShortcut) {
      router.push({
        pathname: routePath,
        params: { shortcut: selectedShortcut },
      });
      return;
    }

    router.push(routePath);
  };

  return (
    <TouchableOpacity onPress={() => handleNavigate()} style={styles.cardClick}>
      <View style={styles.card}>
        <Image source={banner} resizeMode="cover" style={styles.image} />
        <Text style={styles.shortcut}>{title}</Text>

        <View className='buttonsView' style={styles.buttonsView}>
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation();
              handleNavigate(shortcut[0]);
            }}
            style={styles.button}
          >
            <Image source={icon[0]} style={styles.icons} />
            <Text style={styles.buttonText}>{shortcut[0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation();
              handleNavigate(shortcut[1]);
            }}
            style={styles.button}
          >
            <Image source={icon[1]} style={styles.icons} />
            <Text style={styles.buttonText}>{shortcut[1]}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

}


const styles = StyleSheet.create({
  card: {
    position: "relative",
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    height: 360,
    justifyContent: "flex-end",
    backgroundColor: colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },

  shortcut: {
    padding: 16,
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: -8
  },

  buttonsView: {
    width: "100%",
    flexDirection: "row",
    padding: 16,
    gap: 12,
    justifyContent: "space-between"
  },
  button: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: colors.buttonsBackground,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 10,
    paddingHorizontal: 8,
  },
  icons: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    flexShrink: 1,
  },

  cardClick: {
    zIndex: 2,
    elevation: 2
  }

});
