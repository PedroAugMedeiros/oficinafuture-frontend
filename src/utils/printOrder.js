import * as Print from 'expo-print';
import { Platform } from 'react-native';

const STATUS_COLORS = {
  Aberta: {
    background: '#DBEAFE',
    color: '#1D4ED8',
  },
  Concluida: {
    background: '#DCFCE7',
    color: '#15803D',
  },
  Cancelada: {
    background: '#FEE2E2',
    color: '#DC2626',
  },
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) {
    return 'Nao informado';
  }

  const parsedValue = Number(value);
  const date = new Date(Number.isNaN(parsedValue) ? value : parsedValue);

  if (Number.isNaN(date.getTime())) {
    return 'Nao informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const waitForImages = (printWindow) => {
  const images = Array.from(printWindow.document.images);

  if (images.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })
    )
  );
};

const printHtmlOnWeb = async (html) => {
  if (typeof window === 'undefined') {
    throw new Error('Janela de impressao indisponivel no navegador.');
  }

  const printWindow = window.open('', '_blank', 'width=960,height=720');

  if (!printWindow) {
    throw new Error('O navegador bloqueou a janela de impressao.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise((resolve) => {
    const handleLoad = async () => {
      await waitForImages(printWindow);

      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };

      resolve();
    };

    if (printWindow.document.readyState === 'complete') {
      handleLoad();
      return;
    }

    printWindow.addEventListener('load', handleLoad, { once: true });
  });
};

export const buildOrderPrintHtml = (order) => {
  const statusStyles = STATUS_COLORS[order?.status] ?? {
    background: '#E2E8F0',
    color: '#334155',
  };

  const imageSection = order?.image
    ? `<img class="hero-image" src="${escapeHtml(order.image)}" alt="Imagem da OS ${escapeHtml(order?.osId)}" />`
    : '<div class="hero-placeholder">Sem imagem cadastrada</div>';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>OS ${escapeHtml(order?.osId)}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 18mm;
          }

          body {
            margin: 0;
            background: #eef2ff;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
          }

          .page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 32px;
            background: #ffffff;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }

          .company-block h1 {
            margin: 0;
            font-size: 28px;
            color: #0b0f2f;
          }

          .company-block p {
            margin: 8px 0 0;
            color: #475569;
            font-size: 14px;
          }

          .status-chip {
            padding: 10px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            background: ${statusStyles.background};
            color: ${statusStyles.color};
          }

          .hero-image,
          .hero-placeholder {
            width: 100%;
            height: 240px;
            border-radius: 18px;
            margin-bottom: 24px;
          }

          .hero-image {
            object-fit: cover;
            background: #e2e8f0;
          }

          .hero-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            color: #1d4ed8;
            font-weight: 700;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 18px;
            background: #f8fafc;
          }

          .card-label {
            margin: 0 0 8px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #64748b;
          }

          .card-value {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            word-break: break-word;
          }

          .footer {
            margin-top: 28px;
            padding-top: 18px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
          }

          @media print {
            body {
              background: #ffffff;
            }

            .page {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div class="company-block">
              <h1>Ordem de Servico</h1>
              <p>Documento gerado a partir dos dados da OS selecionada.</p>
            </div>
            <div class="status-chip">${escapeHtml(order?.status || 'Nao informado')}</div>
          </header>

          ${imageSection}

          <section class="grid">
            <article class="card">
              <p class="card-label">Numero da OS</p>
              <p class="card-value">${escapeHtml(order?.osId || 'Nao informado')}</p>
            </article>

            <article class="card">
              <p class="card-label">Data de criacao</p>
              <p class="card-value">${escapeHtml(formatDate(order?.createdAt))}</p>
            </article>

            <article class="card">
              <p class="card-label">Titulo</p>
              <p class="card-value">${escapeHtml(order?.title || 'Nao informado')}</p>
            </article>

            <article class="card">
              <p class="card-label">Cliente</p>
              <p class="card-value">${escapeHtml(order?.client || 'Nao informado')}</p>
            </article>
          </section>

          <footer class="footer">
            Impressao preparada para PDF. No navegador, use a opcao "Salvar em PDF".
          </footer>
        </main>
      </body>
    </html>
  `;
};

export const printOrder = async (order) => {
  const html = buildOrderPrintHtml(order);

  if (Platform.OS === 'web') {
    await printHtmlOnWeb(html);
    return;
  }

  await Print.printAsync({ html });
};

export const printOrderToFile = async (order) => {
  const html = buildOrderPrintHtml(order);

  if (Platform.OS === 'web') {
    await printHtmlOnWeb(html);
    return null;
  }

  return Print.printToFileAsync({ html });
};