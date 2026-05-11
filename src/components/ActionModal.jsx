import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import legacyStatusOptions from '../app/services/status.json';
import { colors } from '../app/styles/colors';

const buildLegacyFields = () => [
  { key: 'osId', label: 'Numero da OS', keyboardType: 'numeric' },
  { key: 'title', label: 'Titulo', required: true },
  { key: 'client', label: 'Cliente', required: true },
  {
    key: 'status',
    label: 'Status',
    type: 'chips',
    options: legacyStatusOptions,
  },
  { key: 'image', label: 'Imagem (URL/Base64)', type: 'image' },
  { key: 'createdAt', label: 'Criado em (timestamp)', keyboardType: 'numeric' },
];

const getFieldValue = (values, fieldKey) => String(values?.[fieldKey] ?? '');

export default function ActionModal(props) {
  const {
    visible,
    isDetailsVisible,
    title = 'Detalhes do cadastro',
    fields,
    values,
    detailsForm,
    isEditing = false,
    isCreatingItem = false,
    isSaving = false,
    isDeleting = false,
    canDelete = true,
    saveLabel = 'Salvar',
    editLabel = 'Editar',
    deleteLabel = 'Excluir',
    secondaryActionLabel,
    secondaryAction,
    onClose,
    closeDetailsModal,
    onDelete,
    handleDeleteOrder,
    onSave,
    handleSaveChanges,
    onEdit,
    setIsEditing,
    onChangeField,
    handleChangeDetailField,
    handlePrintOrder,
  } = props;

  const resolvedVisible = visible ?? isDetailsVisible ?? false;
  const resolvedFields = fields ?? buildLegacyFields();
  const resolvedValues = values ?? detailsForm ?? {};
  const resolvedOnClose = onClose ?? closeDetailsModal ?? (() => { });
  const resolvedOnDelete = onDelete ?? handleDeleteOrder ?? (() => { });
  const resolvedOnSave = onSave ?? handleSaveChanges ?? (() => { });
  const resolvedOnEdit =
    onEdit ?? (setIsEditing ? () => setIsEditing(true) : undefined);
  const resolvedOnChangeField =
    onChangeField ?? handleChangeDetailField ?? (() => { });
  const resolvedSecondaryAction =
    secondaryAction ??
    (handlePrintOrder ? () => handlePrintOrder(resolvedValues) : undefined);
  const resolvedSecondaryActionLabel =
    secondaryActionLabel ??
    (handlePrintOrder ? 'Imprimir / PDF' : undefined);
  const showDelete = canDelete && !isCreatingItem;

  const renderField = (field) => {
    const value = getFieldValue(resolvedValues, field.key);
    const isChipField = field.type === 'chips';
    const isImageField = field.type === 'image';
    const editable = field.editable !== false && isEditing;

    if (isChipField) {
      return (
        <View key={field.key}>
          <Text style={styles.inputLabel}>{field.label}</Text>
          <View style={styles.statusRow}>
            {field.options?.map((option) => {
              const isActive = option === value;

              return (
                <Pressable
                  key={option}
                  onPress={() =>
                    editable && resolvedOnChangeField(field.key, option)
                  }
                  style={[
                    styles.statusChip,
                    isActive && styles.statusChipActive,
                    !editable && styles.statusChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isActive && styles.statusChipTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View key={field.key}>
        <Text style={styles.inputLabel}>{field.label}</Text>
        <TextInput
          value={value}
          multiline={field.multiline}
          numberOfLines={field.multiline ? 4 : 1}
          keyboardType={field.keyboardType}
          placeholder={field.placeholder}
          onChangeText={(nextValue) =>
            resolvedOnChangeField(field.key, nextValue)
          }
          style={[
            styles.input,
            field.multiline && styles.multilineInput,
            !editable && styles.inputDisabled,
          ]}
          editable={editable}
        />

        {isImageField && value ? (
          <Image source={{ uri: value }} style={styles.detailsImage} />
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      visible={resolvedVisible}
      animationType="slide"
      transparent
      onRequestClose={resolvedOnClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={resolvedOnClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {resolvedFields.map(renderField)}
          </ScrollView>

          <View style={styles.modalFooter}>
            {resolvedSecondaryActionLabel && resolvedSecondaryAction ? (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.secondaryButton,
                  pressed && styles.actionButtonPressed,
                  (isSaving || isDeleting) && styles.actionButtonDisabled,
                ]}
                onPress={resolvedSecondaryAction}
                disabled={isSaving || isDeleting}
              >
                <Text style={styles.actionButtonText}>
                  {resolvedSecondaryActionLabel}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.footerSpacer} />
            )}

            <View style={styles.modalActions}>
              {showDelete ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    pressed && styles.actionButtonPressed,
                    (isDeleting || isSaving) && styles.actionButtonDisabled,
                  ]}
                  onPress={resolvedOnDelete}
                  disabled={isDeleting || isSaving}
                >
                  <Text style={styles.actionButtonText}>{deleteLabel}</Text>
                </Pressable>
              ) : null}

              {!isEditing ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.changeButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={resolvedOnEdit}
                  disabled={!resolvedOnEdit || isDeleting || isSaving}
                >
                  <Text style={styles.actionButtonText}>{editLabel}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.saveButton,
                    pressed && styles.actionButtonPressed,
                    (isSaving || isDeleting) && styles.actionButtonDisabled,
                  ]}
                  onPress={resolvedOnSave}
                  disabled={isSaving || isDeleting}
                >
                  <Text style={styles.actionButtonText}>
                    {isSaving ? 'Salvando...' : saveLabel}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 16,
    zIndex: 3
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    maxHeight: '92%',
    padding: 20,
  },

  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },

  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  closeButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },

  modalBody: {
    maxHeight: '78%',
  },

  inputLabel: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },

  input: {
    backgroundColor: colors.soft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  multilineInput: {
    minHeight: 104,
    textAlignVertical: 'top',
  },

  inputDisabled: {
    opacity: 0.85,
  },

  detailsImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: colors.border,
  },

  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },

  statusChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  statusChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },

  statusChipDisabled: {
    opacity: 0.9,
  },

  statusChipText: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: '600',
  },

  statusChipTextActive: {
    color: colors.accent,
  },

  modalFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 8,
  },

  footerSpacer: {
    flex: 1,
  },

  modalActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },

  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  actionButtonDisabled: {
    opacity: 0.6,
  },

  deleteButton: {
    backgroundColor: colors.danger,
  },

  changeButton: {
    backgroundColor: colors.accent,
  },

  saveButton: {
    backgroundColor: colors.success,
  },

  secondaryButton: {
    backgroundColor: colors.primary,
  },

  actionButtonPressed: {
    opacity: 0.9,
  },

  actionButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});