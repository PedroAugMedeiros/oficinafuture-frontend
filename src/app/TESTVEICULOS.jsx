import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ActionModal from '../components/ActionModal.jsx';
import FilterList from '../components/FilterList.jsx';
import PaginationControl from '../components/PaginationControl.jsx';
import { veiculosService } from './services/api.js';
import { buildVehicleFields, initialVehicleForm } from './services/baseForms.js';
import { FILTER_OPTIONS_VEHICLES } from './services/filters.js';
import { colors } from './styles/colors.js';

const DEFAULT_PER_PAGE = 10;

const normalizeValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function TESTVEICULOS() {
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const [selectedField, setSelectedField] = useState('placa');
  const [searchValue, setSearchValue] = useState('');

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(initialVehicleForm);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsForm, setDetailsForm] = useState({});

  useEffect(() => {
    resetList();
  }, []);

  const resetList = () => {
    setVehicles([]);
    setPage(1);
    setHasMore(true);
    loadMoreData(1, true);
  };

  const loadMoreData = async (pageToLoad = page, replace = false) => {
    if (loading || (!hasMore && !replace)) return;

    setLoading(true);
    try {
      const res = await veiculosService.list({ page: pageToLoad });
      const rawData = res.data.results ?? res.data;
      const newData = Array.isArray(rawData) ? rawData : [];

      if (newData.length === 0) {
        setHasMore(false);
        if (replace) setVehicles([]);
        return;
      }

      setVehicles((current) => {
        if (replace) return newData;
        const existingKeys = new Set(current.map((item) => String(item.id)));
        const nextItems = newData.filter((item) => !existingKeys.has(String(item.id)));
        return [...current, ...nextItems];
      });

      setPage(pageToLoad + 1);
      if (!res.data.next) setHasMore(false);
    } catch (err) {
      console.log('Erro ao carregar Veículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchValue.trim()
    ? vehicles.filter((item) =>
        normalizeValue(item[selectedField]).includes(normalizeValue(searchValue))
      )
    : vehicles;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * perPage, safePage * perPage);

  const stats = {
    total: vehicles.length,
    ativos: vehicles.length, // Placeholder
    lowStock: 0, // Not applicable
  };

  const handleOpenCreate = () => {
    setCreateForm(initialVehicleForm);
    setIsCreateVisible(true);
  };

  const handleCloseCreate = () => {
    setCreateForm(initialVehicleForm);
    setIsCreateVisible(false);
  };

  const handleCreateFieldChange = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateVehicle = async () => {
    if (!createForm.placa?.trim() || !createForm.modelo?.trim()) {
      Alert.alert('Erro', 'Placa e Modelo são obrigatórios.');
      return;
    }

    try {
      setIsCreating(true);
      const res = await veiculosService.create({
        placa: createForm.placa,
        modelo: createForm.modelo,
        marca: createForm.marca,
        ano: createForm.ano,
        cliente: 1, // Padrão
      });
      setVehicles((prev) => [res.data, ...prev]);
      handleCloseCreate();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o veículo.');
    } finally {
      setIsCreating(false);
    }
  };

  const openDetailsModal = (item) => {
    setSelectedVehicle(item);
    setDetailsForm({
      placa: item.placa,
      modelo: item.modelo,
      marca: item.marca,
      ano: String(item.ano || ''),
      cor: item.cor || '',
    });
    setIsEditing(false);
    setIsDetailsVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsVisible(false);
    setIsEditing(false);
    setSelectedVehicle(null);
  };

  const handleChangeDetailField = (field, value) => {
    setDetailsForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedVehicle) return;
    try {
      setIsSaving(true);
      const res = await veiculosService.patch(selectedVehicle.id, detailsForm);
      setVehicles((current) =>
        current.map((item) => (String(item.id) === String(selectedVehicle.id) ? res.data : item))
      );
      setSelectedVehicle(res.data);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o veículo placa "${selectedVehicle.placa}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await veiculosService.delete(selectedVehicle.id);
              setVehicles((current) =>
                current.filter((item) => String(item.id) !== String(selectedVehicle.id))
              );
              closeDetailsModal();
            } catch (error) {
              console.error('Erro ao deletar veículo:', error);
              const msg = error.response?.data?.detail || 'Não foi possível excluir este veículo. Verifique se ele está vinculado a alguma Ordem de Serviço.';
              Alert.alert('Erro', msg);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.vehicleCard} onPress={() => openDetailsModal(item)}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{item.marca?.charAt(0).toUpperCase() || 'V'}</Text>
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.placa}>{item.placa}</Text>
        <Text style={styles.modelo}>{item.marca} {item.modelo}</Text>
        <Text style={styles.meta}>Ano: {item.ano} · {item.cor || 'Cor N/A'}</Text>
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <View>
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
      <Text style={styles.subtitle}>GESTÃO DE VEÍCULOS</Text>
      <Text style={styles.title}>Frotas e Clientes</Text>
      <Pressable style={styles.createButton} onPress={handleOpenCreate}>
        <Text style={styles.createButtonText}>Novo Veículo</Text>
      </Pressable>

      <View style={styles.cardsContainer}>
        <View style={[styles.statCard, styles.blueBorder]}>
          <Text style={styles.cardNumber}>{stats.total}</Text>
          <Text style={styles.cardLabel}>Total de Veículos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Veículos Cadastrados</Text>
      <FilterList
        selectedField={selectedField}
        searchValue={searchValue}
        onSelectField={setSelectedField}
        onSearchChange={setSearchValue}
        filterOptions={FILTER_OPTIONS_VEHICLES}
      />
      <PaginationControl
        currentPage={safePage}
        totalItems={filteredData.length}
        itemsPerPage={perPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(v) => {
          setPerPage(v);
          setCurrentPage(1);
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => loading && <ActivityIndicator style={{ padding: 20 }} color={colors.accent} />}
        ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ActionModal
        visible={isDetailsVisible}
        title="Detalhes do Veículo"
        fields={buildVehicleFields()}
        values={detailsForm}
        isEditing={isEditing}
        isSaving={isSaving}
        isDeleting={isDeleting}
        canDelete={true}
        onClose={closeDetailsModal}
        onDelete={handleDeleteVehicle}
        onSave={handleSaveChanges}
        onEdit={() => setIsEditing(true)}
        onChangeField={handleChangeDetailField}
      />

      <Modal visible={isCreateVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Veículo</Text>
              <Pressable onPress={handleCloseCreate}><Text style={styles.closeButtonText}>Fechar</Text></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {buildVehicleFields().map((field) => (
                <View key={field.key} style={{ marginBottom: 12 }}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    value={String(createForm[field.key] || '')}
                    onChangeText={(v) => handleCreateFieldChange(field.key, v)}
                    placeholder={field.placeholder}
                    style={styles.input}
                  />
                </View>
              ))}
              <Pressable
                style={[styles.submitButton, isCreating && { opacity: 0.5 }]}
                onPress={handleCreateVehicle}
                disabled={isCreating}
              >
                <Text style={styles.submitButtonText}>{isCreating ? 'Cadastrando...' : 'Cadastrar Veículo'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingBottom: 40 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  subtitle: { fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.primary, marginBottom: 16 },
  createButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20 },
  createButtonText: { color: colors.surface, fontWeight: '700' },
  cardsContainer: { gap: 12, marginBottom: 20 },
  statCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.accent },
  cardNumber: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  cardLabel: { fontSize: 12, color: colors.muted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  vehicleCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.primary, fontWeight: 'bold', fontSize: 18 },
  vehicleInfo: { flex: 1 },
  placa: { fontSize: 16, fontWeight: '800', color: colors.accent },
  modelo: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  emptyText: { textAlign: 'center', padding: 20, color: colors.muted },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  closeButtonText: { color: colors.danger, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  input: { backgroundColor: colors.soft, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
  submitButton: { backgroundColor: colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: colors.surface, fontWeight: '800' },
});
