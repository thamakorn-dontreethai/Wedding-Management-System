import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US');

const toSafeFilename = (value) => String(value || 'receipt').replace(/[^a-zA-Z0-9-_]/g, '_');

const getPdfSafeCustomerLabel = (receipt) => {
  const email = receipt.customerId?.email;
  if (email) return email;

  const username = String(receipt.customerId?.username || '').trim();
  if (username && /^[\x20-\x7E]+$/.test(username)) return username;

  return 'customer';
};

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/receipts')
      .then(({ data }) => setReceipts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = useMemo(
    () => receipts.reduce((sum, receipt) => sum + (Number(receipt.amount) || 0), 0),
    [receipts],
  );

  const downloadReceiptPdf = (receipt) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Wedding Receipt', 14, 18);
    doc.setFontSize(11);
    doc.text(`Receipt No: ${receipt.receiptNo || '-'}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      theme: 'grid',
      head: [['Field', 'Value']],
      body: [
        ['Customer', getPdfSafeCustomerLabel(receipt)],
        ['Venue', receipt.bookingId?.venueName || '-'],
        ['Installment', String(receipt.installment || '-')],
        ['Amount', `THB ${(receipt.amount || 0).toLocaleString()}`],
        ['Issued Date', formatDate(receipt.issuedAt || receipt.createdAt)],
        ['Issued By', receipt.issuedBy?.username || receipt.issuedBy?.email || '-'],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [236, 72, 153] },
      columnStyles: { 0: { cellWidth: 45 } },
    });

    const filename = `receipt-${toSafeFilename(receipt.receiptNo || receipt._id)}.pdf`;
    doc.save(filename);
  };

  const toDateFilename = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const downloadAllReceiptsPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('Wedding Receipts Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDate(new Date())}`, 14, 23);
    doc.text(`Total Receipts: ${receipts.length}`, 80, 23);
    doc.text(`Total Amount: THB ${totalAmount.toLocaleString()}`, 140, 23);

    autoTable(doc, {
      startY: 30,
      theme: 'striped',
      head: [['Receipt No', 'Customer', 'Venue', 'Installment', 'Amount (THB)', 'Issued Date']],
      body: receipts.map((receipt) => [
        receipt.receiptNo || '-',
        getPdfSafeCustomerLabel(receipt),
        receipt.bookingId?.venueName || '-',
        String(receipt.installment || '-'),
        (receipt.amount || 0).toLocaleString(),
        formatDate(receipt.issuedAt || receipt.createdAt),
      ]),
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [236, 72, 153] },
    });

    doc.save(`receipts-report-${toDateFilename()}.pdf`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">🧾 Receipts</h1>
        <p className="page-header__sub">All issued receipts in the system</p>
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={downloadAllReceiptsPdf}
            disabled={loading || receipts.length === 0}
            style={{
              border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, color: 'white',
              cursor: loading || receipts.length === 0 ? 'not-allowed' : 'pointer',
              background: loading || receipts.length === 0 ? 'var(--gray-300)' : 'linear-gradient(135deg, #4f46e5, #2563eb)',
            }}
          >
            ⬇️ Download All PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--gray-50)' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--gray-900)' }}>{receipts.length}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>Total Receipts</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: '#f0fdf4' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>฿{totalAmount.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>Total Amount</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--pink-bg)' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--pink)' }}>
            {receipts.filter((r) => r.installment === 2).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>Installment 2 Receipts</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
      ) : receipts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🧾</div>
          <p className="empty-state__title">No receipts yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {receipts.map((receipt) => (
            <div key={receipt._id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr 1fr auto', gap: 12, background: 'white', border: '1px solid var(--gray-100)', borderRadius: 14, padding: '14px 16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{receipt.receiptNo}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  {receipt.customerId?.username || receipt.customerId?.email || 'Customer'}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                {receipt.bookingId?.venueName || '-'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                Installment {receipt.installment}
              </div>
              <div style={{ fontWeight: 700, color: '#16a34a', textAlign: 'right' }}>
                ฿{(receipt.amount || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'right' }}>
                {new Date(receipt.issuedAt || receipt.createdAt).toLocaleDateString('en-US')}
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => downloadReceiptPdf(receipt)}
                  style={{ border: '1px solid #93c5fd', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700, padding: '6px 10px', cursor: 'pointer' }}>
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;
