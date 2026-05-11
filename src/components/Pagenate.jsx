import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { printOrder } from '../utils/printOrder.js';
import ActionModal from './ActionModal.jsx';
import { FilterList } from './FilterList.jsx';
import { ordensService } from '../app/services/api.js';

const normalizeValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function Pagenate(props) {
  const { osQuant, isCreating, setOrders } = props;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [onEndReachedCalled, setOnEndReachedCalled] = useState(false);
  const [selectedField, setSelectedField] = useState('title');
  const [searchValue, setSearchValue] = useState('');
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

  const handlePrintOrder = async (order) => {
    try {
      await printOrder(order);
    } catch (error) {
      Alert.alert(
        'Erro ao imprimir',
        error?.message || 'Nao foi possivel gerar o PDF desta OS.'
      );
    }
  };

  useEffect(() => {
    if (!isCreating) {
      resetList();
    }
  }, [osQuant, isCreating]);

  const resetList = () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    loadMoreData(1, true);
  };

  const loadMoreData = async (pageToLoad = page, replace = false) => {
    if (loading || (!hasMore && !replace)) return;

    setLoading(true);

    try {
      const res = await ordensService.list();

      // Backend retorna { count, next, previous, results: [...] }
      const rawData = res.data.results ?? res.data;
      const newData = Array.isArray(rawData) ? rawData : [];
      const sortedNewData = [...newData].sort((a, b) => (b.osId ?? 0) - (a.osId ?? 0));

      if (newData.length === 0) {
        setHasMore(false);

        if (replace) {
          setData([]);
        }

        return;
      }

      setData((currentData) => {
        if (replace) {
          return newData;
        }

        const existingKeys = new Set(
          currentData.map((item) => String(item.id ?? item.osId))
        );

        const nextItems = newData.filter(
          (item) => !existingKeys.has(String(item.id ?? item.osId))
        );

        return [...currentData, ...nextItems];
      });

      setPage(pageToLoad + 1);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchValue.trim()
    ? data.filter((item) =>
      normalizeValue(item[selectedField]).includes(normalizeValue(searchValue))
    )
    : data;

  const openDetailsModal = (item) => {
    setSelectedOrder(item);
    setDetailsForm({
      osId: String(item.osId ?? ''),
      title: String(item.title ?? ''),
      client: String(item.client ?? ''),
      status: String(item.status ?? ''),
      image: String(item.image ?? ''),
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
    setDetailsForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    if (!detailsForm.title.trim() || !detailsForm.client.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha titulo e cliente.');
      return;
    }

    // Backend usa status em minúsculo
    const STATUS_MAP = {
      'Aberta': 'aberta', 'Pendente': 'aberta',
      'Em Andamento': 'andamento',
      'Finalizada': 'concluida', 'Concluida': 'concluida',
      'Cancelada': 'cancelada',
    };
    const statusValue = STATUS_MAP[detailsForm.status.trim()] ?? detailsForm.status.trim().toLowerCase();

    // Payload usa os campos do backend (snake_case / IDs)
    const payload = {
      titulo: detailsForm.title.trim(),
      status: statusValue,
    };

    try {
      setIsSaving(true);
      const orderKey = selectedOrder.id ?? selectedOrder.osId;
      const response = await ordensService.patch(orderKey, payload);

      setData((current) =>
        current.map((item) =>
          String(item.id ?? item.osId) === String(orderKey) ? response.data : item
        )
      );
      setSelectedOrder(response.data);
      setIsEditing(false);
      setOrders((currentOrders) => [response.data, ...currentOrders]);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel salvar as alteracoes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const orderKey = selectedOrder.id ?? selectedOrder.osId;
      await ordensService.delete(orderKey);

      setData((current) =>
        current.filter(
          (item) => String(item.id ?? item.osId) !== String(orderKey))
      );

      closeDetailsModal();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel excluir esta OS.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.osCard}>
      <Pressable style={styles.osCardMain} onPress={() => openDetailsModal(item)}>
        <Image source={{ uri: item.image }} style={styles.osImage} />
        <View style={styles.osContent}>
          <Text style={styles.osTitle}>{item.title}</Text>
          <Text style={styles.osInfo}>Cliente: {item.client}</Text>
          <Text style={styles.osStatus}>{item.status}</Text>
        </View>
      </Pressable>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhuma OS encontrada</Text>
        <Text style={styles.emptyText}>
          Tente alterar o campo selecionado ou o texto digitado.
        </Text>
      </View>
    );
  };

  return (
    <View>
      <FilterList
        selectedField={selectedField}
        searchValue={searchValue}
        onSelectField={setSelectedField}
        onSearchChange={setSearchValue}
      />
      <PaginationControl
        currentPage={safePage}
        totalItems={filteredData.length}
        itemsPerPage={perPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setPerPage(value);
          setCurrentPage(1);
        }}
      />
      <FlatList
        style={styles.container}
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id ?? item.osId)}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        onMomentumScrollBegin={() => setOnEndReachedCalled(false)}
        onEndReached={() => {
          if (!onEndReachedCalled) {
            loadMoreData();
            setOnEndReachedCalled(true);
          }
        }}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />
      <ActionModal closeDetailsModal={closeDetailsModal} isDetailsVisible={isDetailsVisible} detailsForm={detailsForm} isEditing={isEditing} handleDeleteOrder={handleDeleteOrder} isDeleting={isDeleting} isSaving={isSaving} setIsEditing={setIsEditing} handleSaveChanges={handleSaveChanges} handleChangeDetailField={handleChangeDetailField} handlePrintOrder={handlePrintOrder} />

      {/* <View style={styles.fixedFooter}>
        <Text style={styles.footerText}>
          Mostrando {filteredData.length} de {data.length} OS
        </Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 640,
  },

  listContent: {
    paddingBottom: 80,
  },

  osCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },

  osCardMain: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  osImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },

  osContent: {
    flex: 1,
  },

  osTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  osInfo: {
    fontSize: 13,
    color: '#6B7280',
  },

  osStatus: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
    color: '#2563EB',
  },

  loadingFooter: {
    paddingVertical: 20,
  },

  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  footerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 47, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '92%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B0F2F',
  },

  closeTopButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBody: {
    maxHeight: '78%',
  },

  inputLabel: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
  },

  inputDisabled: {
    opacity: 0.85,
  },

  detailsImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#E5E7EB',
  },

  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },

  statusChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  statusChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },

  statusChipDisabled: {
    opacity: 0.9,
  },

  statusChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },

  statusChipTextActive: {
    color: '#1D4ED8',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },

  actionButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 88,
    alignItems: 'center',
  },

  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  closeButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },

  actionButtonPressed: {
    opacity: 0.9,
  },

  actionButtonDisabled: {
    opacity: 0.6,
  },

  deleteButton: {
    backgroundColor: '#DC2626',
  },

  changeButton: {
    backgroundColor: '#1D4ED8',
  },

  saveButton: {
    backgroundColor: '#16A34A',
  },

  secondaryButton: {
    backgroundColor: '#0F172A',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});