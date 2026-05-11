import { CATEGORY_OPTIONS, UNIT_OPTIONS } from "./filters";

export const initialProductForm = {
    name: '',
    barcode: '',
    category: '',
    brand: '',
    vehicleCompatibility: '',
    costPrice: '',
    salePrice: '',
    stock: '',
    minStock: '',
    unit: 'Unidade',
    supplier: '',
    location: '',
    active: true,
};

export const buildProductFields = () => [
    { key: 'name', label: 'Nome do Produto', required: true },
    { key: 'barcode', label: 'Código de Barras', keyboardType: 'numeric' },
    {
        key: 'category',
        label: 'Categoria',
        type: 'chips',
        options: CATEGORY_OPTIONS,
    },
    { key: 'brand', label: 'Marca' },
    { key: 'vehicleCompatibility', label: 'Compatibilidade Veicular' },
    { key: 'costPrice', label: 'Preço de Custo (R$)', keyboardType: 'numeric' },
    { key: 'salePrice', label: 'Preço de Venda (R$)', keyboardType: 'numeric' },
    { key: 'stock', label: 'Estoque Atual', keyboardType: 'numeric' },
    { key: 'minStock', label: 'Estoque Mínimo', keyboardType: 'numeric' },
    {
        key: 'unit',
        label: 'Unidade',
        type: 'chips',
        options: UNIT_OPTIONS,
    },
    { key: 'supplier', label: 'Fornecedor' },
    { key: 'location', label: 'Localização' },
];

export const initialVehicleForm = {
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    cor: '',
};

export const buildVehicleFields = () => [
    { key: 'placa', label: 'Placa', required: true },
    { key: 'modelo', label: 'Modelo', required: true },
    { key: 'marca', label: 'Marca' },
    { key: 'ano', label: 'Ano', keyboardType: 'numeric' },
    { key: 'cor', label: 'Cor' },
];
