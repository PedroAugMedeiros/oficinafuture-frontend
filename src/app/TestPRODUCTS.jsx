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
import { pecasService } from './services/api.js';
import { buildProductFields, initialProductForm } from './services/baseForms.js';
import { FILTER_OPTIONS_PRODUCTS } from './services/filters.js';
import { colors } from './styles/colors.js';

const DEFAULT_PER_PAGE = 10;

const normalizeValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function TestPRODUCTS() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [onEndReachedCalled, setOnEndReachedCalled] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const [selectedField, setSelectedField] = useState('nome');
  const [searchValue, setSearchValue] = useState('');

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(initialProductForm);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsForm, setDetailsForm] = useState({});

  useEffect(() => {
    resetList();
  }, []);

  const resetList = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadMoreData(1, true);
  };

  const loadMoreData = async (pageToLoad = page, replace = false) => {
    if (loading || (!hasMore && !replace)) return;

    setLoading(true);
    try {
      const res = await pecasService.list({ page: pageToLoad });
      const rawData = res.data.results ?? res.data;
      const newData = (Array.isArray(rawData) ? rawData : []).map((item) => ({
        ...item,
        name: item.nome,
        barcode: item.codigo,
        costPrice: item.preco_custo,
        salePrice: item.preco_venda,
        stock: item.quantidade_estoque,
        minStock: item.estoque_minimo,
        vehicleCompatibility: item.descricao,
        brand: item.fornecedor_nome || 'N/A',
        category: 'Peça',
      }));

      if (newData.length === 0) {
        setHasMore(false);
        if (replace) setProducts([]);
        return;
      }

      setProducts((current) => {
        if (replace) return newData;
        const existingKeys = new Set(current.map((item) => String(item.id)));
        const nextItems = newData.filter((item) => !existingKeys.has(String(item.id)));
        return [...current, ...nextItems];
      });

      setPage(pageToLoad + 1);
      if (!res.data.next) setHasMore(false);
    } catch (err) {
      console.log('Erro ao carregar Peças:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchValue.trim()
    ? products.filter((item) =>
        normalizeValue(item[selectedField]).includes(normalizeValue(searchValue))
      )
    : products;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * perPage, safePage * perPage);

  const stats = getStats(products);

  const handleOpenCreate = () => {
    setCreateForm(initialProductForm);
    setIsCreateVisible(true);
  };

  const handleCloseCreate = () => {
    setCreateForm(initialProductForm);
    setIsCreateVisible(false);
  };

  const handleCreateFieldChange = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateProduct = async () => {
    if (!createForm.name?.trim()) {
      Alert.alert('Campo obrigatório', 'Preencha o nome do produto.');
      return;
    }

    try {
      setIsCreating(true);
      const newProduct = {
        nome: createForm.name,
        codigo: createForm.barcode || `PECA-${Date.now()}`,
        preco_venda: parseFloat(createForm.salePrice) || 0,
        preco_custo: parseFloat(createForm.costPrice) || 0,
        quantidade_estoque: parseInt(createForm.stock) || 0,
        estoque_minimo: parseInt(createForm.minStock) || 0,
        descricao: createForm.vehicleCompatibility || '',
        fornecedor: 1, // Padrão
      };

      const response = await pecasService.create(newProduct);
      const created = {
        ...response.data,
        name: response.data.nome,
        barcode: response.data.codigo,
        salePrice: response.data.preco_venda,
        costPrice: response.data.preco_custo,
        stock: response.data.quantidade_estoque,
        minStock: response.data.estoque_minimo,
        vehicleCompatibility: response.data.descricao,
        brand: response.data.fornecedor_nome || 'N/A',
        category: 'Peça',
      };
      setProducts((current) => [created, ...current]);
      handleCloseCreate();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o produto.');
    } finally {
      setIsCreating(false);
    }
  };

  const openDetailsModal = (item) => {
    setSelectedProduct(item);
    setDetailsForm({
      name: String(item.name ?? ''),
      barcode: String(item.barcode ?? ''),
      category: String(item.category ?? ''),
      brand: String(item.brand ?? ''),
      vehicleCompatibility: String(item.vehicleCompatibility ?? ''),
      costPrice: String(item.costPrice ?? ''),
      salePrice: String(item.salePrice ?? ''),
      stock: String(item.stock ?? ''),
      minStock: String(item.minStock ?? ''),
    });
    setIsEditing(false);
    setIsDetailsVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsVisible(false);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleChangeDetailField = (field, value) => {
    setDetailsForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    try {
      setIsSaving(true);
      const payload = {
        nome: detailsForm.name,
        descricao: detailsForm.vehicleCompatibility,
        preco_custo: detailsForm.costPrice,
        preco_venda: detailsForm.salePrice,
        quantidade_estoque: parseInt(detailsForm.stock, 10) || 0,
        estoque_minimo: parseInt(detailsForm.minStock, 10) || 0,
      };
      const response = await pecasService.patch(selectedProduct.id, payload);
      const updated = {
        ...selectedProduct,
        ...response.data,
        name: response.data.nome,
        stock: response.data.quantidade_estoque,
      };

      setProducts((current) =>
        current.map((item) => (String(item.id) === String(selectedProduct.id) ? updated : item))
      );
      setSelectedProduct(updated);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o produto "${selectedProduct.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await pecasService.delete(selectedProduct.id);
              setProducts((current) =>
                current.filter((item) => String(item.id) !== String(selectedProduct.id))
              );
              closeDetailsModal();
            } catch (error) {
              console.error('Erro ao deletar produto:', error);
              const msg = error.response?.data?.detail || 'Não foi possível excluir este produto. Verifique se ele está vinculado a alguma Ordem de Serviço.';
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
    <Pressable style={styles.productCard} onPress={() => openDetailsModal(item)}>
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.categoryBadgeText}>{(item.category || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.productMeta}>Cód: {item.codigo} · {item.brand}</Text>
        <View style={styles.productBottomRow}>
          <Text style={styles.productPrice}>R$ {Number(item.preco_venda).toFixed(2)}</Text>
          <Text style={[styles.productStock, Number(item.stock) <= Number(item.minStock) && styles.productStockLow]}>
            Estoque: {item.stock}
          </Text>
        </View>
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
      <Text style={styles.subtitle}>GESTÃO DE PRODUTOS</Text>
      <Text style={styles.title}>Controle do seu estoque</Text>
      <Pressable style={styles.createButton} onPress={handleOpenCreate}>
        <Text style={styles.createButtonText}>Novo Produto</Text>
      </Pressable>

      <View style={styles.cardsContainer}>
        <View style={[styles.statCard, styles.blueBorder]}>
          <Text style={styles.cardNumber}>{stats.total}</Text>
          <Text style={styles.cardLabel}>Total de Produtos</Text>
        </View>
        <View style={[styles.statCard, styles.greenBorder]}>
          <Text style={styles.cardNumber}>{stats.ativos}</Text>
          <Text style={styles.cardLabel}>Produtos Ativos</Text>
        </View>
        <View style={[styles.statCard, styles.orangeBorder]}>
          <Text style={styles.cardNumber}>{stats.lowStock}</Text>
          <Text style={styles.cardLabel}>Estoque Baixo</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Produtos Cadastrados</Text>
      <FilterList
        selectedField={selectedField}
        searchValue={searchValue}
        onSelectField={setSelectedField}
        onSearchChange={setSearchValue}
        filterOptions={FILTER_OPTIONS_PRODUCTS}
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

  const renderCreateField = (field) => {
    const value = createForm[field.key] ?? '';
    return (
      <View key={field.key} style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>{field.label}</Text>
        <TextInput
          value={String(value)}
          onChangeText={(v) => handleCreateFieldChange(field.key, v)}
          placeholder={field.placeholder || `Informe ${field.label.toLowerCase()}`}
          keyboardType={field.keyboardType}
          style={styles.input}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => loading && <ActivityIndicator style={{ padding: 20 }} color={colors.accent} />}
        ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ActionModal
        visible={isDetailsVisible}
        title="Detalhes do Produto"
        fields={buildProductFields()}
        values={detailsForm}
        isEditing={isEditing}
        isSaving={isSaving}
        isDeleting={isDeleting}
        canDelete={true}
        onClose={closeDetailsModal}
        onDelete={handleDeleteProduct}
        onSave={handleSaveChanges}
        onEdit={() => setIsEditing(true)}
        onChangeField={handleChangeDetailField}
      />

      <Modal visible={isCreateVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Produto</Text>
              <Pressable onPress={handleCloseCreate}><Text style={styles.closeButtonText}>Fechar</Text></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {buildProductFields().map(renderCreateField)}
              <Pressable
                style={[styles.submitButton, isCreating && { opacity: 0.5 }]}
                onPress={handleCreateProduct}
                disabled={isCreating}
              >
                <Text style={styles.submitButtonText}>{isCreating ? 'Criando...' : 'Criar Produto'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStats(data) {
  return {
    total: data.length,
    ativos: data.length, // Placeholder
    lowStock: data.filter((p) => Number(p.stock) <= Number(p.minStock)).length,
  };
}

function getCategoryColor(category) {
  const map = { Lubrificante: '#F59E0B', Filtro: '#3B82F6', Freio: '#EF4444' };
  return map[category] || colors.accent;
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
  statCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4 },
  blueBorder: { borderLeftColor: colors.accent },
  greenBorder: { borderLeftColor: colors.success },
  orangeBorder: { borderLeftColor: colors.warning },
  cardNumber: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  cardLabel: { fontSize: 12, color: colors.muted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  productCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryBadgeText: { color: colors.surface, fontSize: 18, fontWeight: '700' },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: colors.text },
  productMeta: { fontSize: 13, color: colors.muted },
  productBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  productPrice: { fontWeight: 'bold', color: colors.accent },
  productStock: { fontWeight: '600', color: colors.success },
  productStockLow: { color: colors.warning },
  emptyText: { textAlign: 'center', padding: 20, color: colors.muted },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  closeButtonText: { color: colors.danger, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  input: { backgroundColor: colors.soft, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  submitButton: { backgroundColor: colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: colors.surface, fontWeight: '800' },
});
