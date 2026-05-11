import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import ActionModal from '../components/ActionModal.jsx';
import FilterList from '../components/FilterList.jsx';
import PaginationControl from '../components/PaginationControl.jsx';
import { ordensService } from './services/api.js';
import { FILTER_OPTIONS_OS } from './services/filters.js';
import statusOptions from './services/status.json';
import { colors } from './styles/colors.js';

const initialForm = {
  title: '',
  client: '',
  status: 'Pendente',
  image: '',
};

const DEFAULT_PER_PAGE = 20;

const normalizeValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function OSScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [serverStats, setServerStats] = useState(null);

  // ── Filtros ──
  const [selectedField, setSelectedField] = useState('title');
  const [searchValue, setSearchValue] = useState('');

  // ── Modal de criação ──
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  // ── Modal de detalhes (ActionModal) ──
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    osId: '',
    title: '',
    client: '',
    status: '',
    image: '',
    createdAt: '',
  });

  // ──────────── LOAD ────────────
  useEffect(() => {
    loadData();
  }, [currentPage, perPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ordensService.list({ page: currentPage, page_size: perPage });
      const rawData = res.data.results ?? res.data;
      setOrders(Array.isArray(rawData) ? rawData : []);
      
      if (res.data.stats) {
        setServerStats(res.data.stats);
      }
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
      Alert.alert('Erro', 'Não foi possível carregar as ordens de serviço.');
    } finally {
      setLoading(false);
    }
  };


  // ──────────── FILTRO ────────────
  const filteredData = searchValue.trim()
    ? orders.filter((item) =>
        normalizeValue(item[selectedField]).includes(normalizeValue(searchValue))
      )
    : orders;

  const stats = serverStats || getStats(orders);

  // ──────────── HANDLERS CRIAÇÃO ────────────
  const handleOpenForm = () => {
    setFormData(initialForm);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setFormData(initialForm);
  };

  const handleChangeField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      handleChangeField('image', base64);
    }
  };

  const handleCreateOS = async () => {
    if (!formData.title || !formData.client) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha o título e o cliente.');
      return;
    }

    try {
      setIsCreating(true);
      // Mapeia para campos do admin para criação se necessário, 
      // mas ordensService.create usa o schema do backend.
      const payload = {
        titulo: formData.title,
        status: formData.status.toLowerCase().replace(' ', '_'), // backend usa snake_case
        descricao: formData.title, // placeholder
        // Note: backend might need client ID and vehicle ID
        cliente: 1, // Placeholder: in real app, user selects client
        veiculo: 1, // Placeholder
        mecanico: 1, // Placeholder
      };

      const res = await ordensService.create(payload);
      
      // Transform response to match list format if needed
      const created = {
        osId: res.data.id,
        title: res.data.titulo,
        client: res.data.cliente_nome ?? formData.client,
        status: res.data.status,
        image: formData.image,
        createdAt: new Date().getTime(),
      };

      setOrders((prev) => [created, ...prev]);
      handleCloseForm();
      Alert.alert('Sucesso', 'Ordem de serviço criada com sucesso.');
    } catch (err) {
      console.log('Erro ao criar OS:', err);
      Alert.alert('Erro', 'Não foi possível criar a ordem de serviço.');
    } finally {
      setIsCreating(false);
    }
  };

  // ──────────── HANDLERS DETALHES ────────────
  const openDetailsModal = (item) => {
    setSelectedOrder(item);
    setDetailsForm({
      osId: String(item.osId ?? ''),
      title: item.title,
      client: item.client,
      status: item.status,
      image: item.image,
      createdAt: String(item.createdAt ?? ''),
    });
    setIsEditing(false);
    setIsDetailsVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsVisible(false);
    setIsEditing(false);
    setSelectedOrder(null);
  };

  const handleChangeDetailField = (field, value) => {
    setDetailsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const payload = {
        titulo: detailsForm.title,
        status: detailsForm.status.toLowerCase().replace(' ', '_'),
      };
      const res = await ordensService.patch(selectedOrder.osId, payload);
      
      const updated = {
        ...selectedOrder,
        title: res.data.titulo,
        status: res.data.status,
      };

      setOrders((prev) =>
        prev.map((o) => (o.osId === selectedOrder.osId ? updated : o))
      );
      setSelectedOrder(updated);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Alterações salvas.');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta ordem de serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await ordensService.delete(selectedOrder.osId);
              setOrders((prev) => prev.filter((o) => o.osId !== selectedOrder.osId));
              closeDetailsModal();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir a OS.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handlePrintOrder = (order) => {
    Alert.alert('Imprimir', `Gerando PDF para OS #${order.osId}...`);
  };

  // ──────────── RENDERS ────────────
  const renderItem = ({ item }) => (
    <View style={styles.osCard}>
      <Pressable style={styles.osCardMain} onPress={() => openDetailsModal(item)}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.osImage} />
        ) : (
          <View style={[styles.osImage, styles.osImagePlaceholder]}>
            <Text style={styles.placeholderText}>OS</Text>
          </View>
        )}
        <View style={styles.osContent}>
          <Text style={styles.osTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.osInfo}>Cliente: {item.client}</Text>
          <Text style={[styles.osStatus, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
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
        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
            style={styles.avatar}
          />
          <Text style={styles.company}>OFICINA PRO</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>ORDENS DE SERVIÇO</Text>
      <Text style={styles.title}>Controle total das suas O.S</Text>

      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.createButtonPressed,
        ]}
        onPress={handleOpenForm}
      >
        <Text style={styles.createButtonText}>Nova OS</Text>
      </Pressable>

      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.blueBorder]}>
          <Text style={styles.cardNumber}>{stats.abertas}</Text>
          <Text style={styles.cardLabel}>OS Abertas</Text>
        </View>

        <View style={[styles.card, styles.orangeBorder]}>
          <Text style={styles.cardNumber}>{stats.pendentes}</Text>
          <Text style={styles.cardLabel}>Canceladas / Pendentes</Text>
        </View>

        <View style={[styles.card, styles.greenBorder]}>
          <Text style={styles.cardNumber}>{stats.concluidas}</Text>
          <Text style={styles.cardLabel}>Concluídas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Últimas {orders.length} Ordens de Serviço
      </Text>

      <FilterList
        selectedField={selectedField}
        searchValue={searchValue}
        onSelectField={setSelectedField}
        onSearchChange={setSearchValue}
        filterOptions={FILTER_OPTIONS_OS}
      />

      <PaginationControl
        currentPage={currentPage}
        totalItems={orders.length}
        itemsPerPage={perPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(v) => {
          setPerPage(v);
          setCurrentPage(1);
        }}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhuma OS encontrada</Text>
        <Text style={styles.emptyText}>
          Tente alterar o filtro ou o texto digitado.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.osId)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => loading && <ActivityIndicator style={{ padding: 20 }} color={colors.accent} />}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de Detalhes / Edição */}
      <ActionModal
        isDetailsVisible={isDetailsVisible}
        detailsForm={detailsForm}
        isEditing={isEditing}
        isSaving={isSaving}
        isDeleting={isDeleting}
        setIsEditing={setIsEditing}
        closeDetailsModal={closeDetailsModal}
        handleDeleteOrder={handleDeleteOrder}
        handleSaveChanges={handleSaveChanges}
        handleChangeDetailField={handleChangeDetailField}
        handlePrintOrder={handlePrintOrder}
      />

      {/* Modal de Criação */}
      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova OS</Text>
              <Pressable onPress={handleCloseForm} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Título da OS</Text>
              <TextInput
                value={formData.title}
                onChangeText={(v) => handleChangeField('title', v)}
                placeholder="Ex: Revisão de Freios"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Nome do Cliente</Text>
              <TextInput
                value={formData.client}
                onChangeText={(v) => handleChangeField('client', v)}
                placeholder="Ex: João Silva"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Status Inicial</Text>
              <View style={styles.statusRow}>
                {statusOptions.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => handleChangeField('status', status)}
                    style={[
                      styles.statusChip,
                      formData.status === status && styles.statusChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        formData.status === status && styles.statusChipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Imagem do Veículo</Text>
              <Pressable style={styles.input} onPress={pickImage}>
                <Text style={{ color: formData.image ? colors.text : colors.muted }}>
                  {formData.image ? 'Imagem selecionada' : 'Selecionar imagem'}
                </Text>
              </Pressable>

              {formData.image && (
                <Image
                  source={{ uri: formData.image }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.actionButtonPressed,
                  isCreating && styles.actionButtonDisabled,
                ]}
                onPress={handleCreateOS}
                disabled={isCreating}
              >
                <Text style={styles.submitButtonText}>
                  {isCreating ? 'Criando OS...' : 'Criar OS'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ──────────── HELPERS ────────────
function getStats(data) {
  return {
    abertas: data.filter((item) => {
      const s = normalizeValue(item.status);
      return s === 'aberta' || s === 'open' || s.includes('andamento');
    }).length,
    pendentes: data.filter((item) => {
      const s = normalizeValue(item.status);
      return s === 'pendente' || s === 'cancelada' || s === 'pending';
    }).length,
    concluidas: data.filter((item) => {
      const s = normalizeValue(item.status);
      return s === 'concluida' || s === 'finalizada' || s === 'completed';
    }).length,
  };
}

function getStatusStyle(status) {
  const s = status?.toUpperCase() || '';
  if (s === 'ABERTA' || s === 'OPEN') return { color: colors.accent };
  if (s === 'CONCLUIDA' || s === 'FINALIZADA' || s === 'COMPLETED') return { color: colors.success };
  if (s === 'CANCELADA') return { color: colors.danger };
  return { color: colors.warning };
}

// ──────────── STYLES ────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  company: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  blueBorder: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  orangeBorder: { borderLeftWidth: 4, borderLeftColor: colors.warning },
  greenBorder: { borderLeftWidth: 4, borderLeftColor: colors.success },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 10,
  },
  osCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  osCardMain: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 14,
  },
  osImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.soft,
  },
  osImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: colors.muted,
    fontWeight: 'bold',
    fontSize: 12,
  },
  osContent: {
    flex: 1,
  },
  osTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  osInfo: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  osStatus: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loadingFooter: {
    paddingVertical: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.soft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  statusChipTextActive: {
    color: colors.accent,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: colors.soft,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  actionButtonPressed: { opacity: 0.9 },
  actionButtonDisabled: { opacity: 0.5 },
});
