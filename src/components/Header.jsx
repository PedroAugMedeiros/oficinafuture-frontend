import { colors } from '@/app/styles/colors'
import { Image, StyleSheet, Text, View, Pressable } from "react-native"
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { signOut } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.headerView1}>
        <Image
          style={styles.tinyLogo}
          source={{
            uri: "https://reactnative.dev/img/tiny_logo.png",
          }}
        />
        <Text style={styles.title}>OFICINA PRO</Text>
      </View>
      <View style={styles.headerView2}>
        <Pressable onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },

  headerView1: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  tinyLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  }
})