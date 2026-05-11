import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../app/styles/colors.js';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

function buildPageRange(currentPage, totalPages) {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();

  // Sempre inclui a primeira página
  pages.add(1);

  // Páginas ao redor da atual (window de ±2)
  const windowStart = Math.max(2, currentPage - 2);
  const windowEnd = Math.min(totalPages - 1, currentPage + 2);

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.add(i);
  }

  // Sempre inclui as duas últimas
  if (totalPages > 1) pages.add(totalPages - 1);
  pages.add(totalPages);

  const sorted = [...pages].sort((a, b) => a - b);

  // Insere '...' onde houver "buracos"
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}

export default function PaginationControl({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Intervalo "Mostrando X - Y de Z"
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = useMemo(
    () => buildPageRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // ── Handlers ──
  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange?.(p);
  };

  const handleSelectPerPage = (value) => {
    setIsDropdownOpen(false);
    if (value !== itemsPerPage) {
      onItemsPerPageChange?.(value);
      onPageChange?.(1); // Volta à primeira página
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.7}
          onPress={() => setIsDropdownOpen(true)}
        >
          <Text style={styles.dropdownButtonText}>{itemsPerPage}</Text>
          <Text style={styles.dropdownChevron}>▼</Text>
        </TouchableOpacity>

        <View style={styles.infoText}>
          <Text style={styles.infoHighlight}>
            Mostrando {rangeEnd} de {totalItems} Produtos
          </Text>
        </View>

      </View>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === 1 && styles.navButtonDisabled,
          ]}
          activeOpacity={0.7}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text
            style={[
              styles.navButtonText,
              currentPage === 1 && styles.navButtonTextDisabled,
            ]}
          >
            ‹ Anterior
          </Text>
        </TouchableOpacity>

        {/* Lista de páginas */}
        <View style={styles.pagesRow}>
          {pages.map((page, index) => {
            if (page === '...') {
              return (
                <View key={`dots-${index}`} style={styles.dotsContainer}>
                  <Text style={styles.dotsText}>…</Text>
                </View>
              );
            }

            const isActive = page === currentPage;
            return (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageButton,
                  isActive && styles.pageButtonActive,
                ]}
                activeOpacity={0.7}
                onPress={() => goToPage(page)}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    isActive && styles.pageButtonTextActive,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão Próxima */}
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === totalPages && styles.navButtonDisabled,
          ]}
          activeOpacity={0.7}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.navButtonText,
              currentPage === totalPages && styles.navButtonTextDisabled,
            ]}
          >
            Próxima ›
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Itens por página</Text>

            {ITEMS_PER_PAGE_OPTIONS.map((option) => {
              const isSelected = option === itemsPerPage;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectPerPage(option)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option} itens
                  </Text>
                  {isSelected && (
                    <Text style={styles.dropdownCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ──────────── STYLES ────────────
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.borderStrong,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 2,
  },



  perPageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.soft,
  },

  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  dropdownChevron: {
    fontSize: 8,
    color: colors.muted,
  },



  infoHighlight: {
    fontWeight: '700',
    color: '#ffffff',
  },

  // ── Linha inferior (navegação) ──

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#ffff',
    borderRadius: 12,


  },

  navButton: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
    maxWidth: '100%',
    height: 'stretch',
    maxHeight: 40
  },

  navButtonDisabled: {
    opacity: 0.4,
  },

  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },

  pagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 3,
    justifyContent: 'center',
    maxWidth: '40%',
  },

  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderStrong,
    borderWidth: 1,
  },

  pageButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,

  },

  pageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface,
  },

  pageButtonTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },

  dotsContainer: {
    minWidth: 24,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotsText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
  },

  // ── Dropdown modal ──
  dropdownOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  dropdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 280,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
    textAlign: 'center',
  },

  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },

  dropdownOptionActive: {
    backgroundColor: colors.accentSoft,
  },

  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  dropdownOptionTextActive: {
    color: colors.accent,
  },

  dropdownCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },

});
