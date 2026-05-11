import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';



const FILTER_OPTIONS = [
  { label: 'Titulo', value: 'title' },
  { label: 'Cliente', value: 'client' },
  { label: 'Status', value: 'status' },
];

export default function FilterList({
  selectedField = 'title',
  searchValue = '',
  onSelectField,
  onSearchChange,
  filterOptions,
}) {
  const [localValue, setLocalValue] = useState(searchValue);

useEffect(() => {
  const timeout = setTimeout(() => {
    onSearchChange(localValue);
  }, 30);

  return () => clearTimeout(timeout);
}, [localValue]);

  const options = filterOptions || FILTER_OPTIONS;
  const selectedOption =
    options.find((option) => option.value === selectedField) ??
    options[0];

  const handleSelectField = (field) => {
    onSelectField?.(field);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Selecionar filtro</Text>


      </View>
        <View style={styles.optionsContainer}>

          {options.map((option) => {
            const isActive = option.value === selectedField;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelectField(option.value)}
                style={[
                  styles.optionButton,
                  isActive && styles.optionButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    isActive && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
          <Text style={styles.selectButtonText}>{`Filtrando por ${selectedOption.label}`}</Text>


      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={`Buscar por ${selectedOption.label.toLowerCase()}`}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  selectButtonPressed: {
    opacity: 0.9,
  },

  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  chevron: {
    fontSize: 12,
    color: '#64748B',
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },

  optionButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },

  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  optionButtonTextActive: {
    color: '#1D4ED8',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
});