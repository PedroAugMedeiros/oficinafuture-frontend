import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './styles/colors';
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function TestScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Pressable 
                onPress={() => navigation.navigate('index')}
                style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.actionButtonPressed
                ]}
            >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
            <Text style={styles.title}>Test Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 20,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonPressed: {
        opacity: 0.7,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.primary,
    }
})