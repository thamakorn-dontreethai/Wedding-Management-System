import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_MAP = {
	pending: { label: 'รอชำระมัดจำ งวด 1', color: '#d97706', bg: '#fffbeb' },
	deposit1_pending: { label: 'รอชำระมัดจำ งวด 1', color: '#d97706', bg: '#fffbeb' },
	deposit1_paid: { label: 'ชำระงวด 1 แล้ว รอยืนยัน', color: '#2563eb', bg: '#eff6ff' },
	deposit2_pending: { label: 'รอชำระงวด 2', color: '#7c3aed', bg: '#f5f3ff' },
	deposit2_paid: { label: 'ชำระงวด 2 แล้ว รอยืนยัน', color: '#2563eb', bg: '#eff6ff' },
	confirmed: { label: '✅ ยืนยันแล้ว', color: '#16a34a', bg: '#f0fdf4' },
	completed: { label: '🎉 เสร็จสิ้น', color: '#16a34a', bg: '#f0fdf4' },
	cancelled: { label: '❌ ยกเลิกแล้ว', color: '#dc2626', bg: '#fff5f5' },
};

const MyBookingsPage = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api.get('/bookings/my')
			.then(({ data }) => setBookings(data))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	if (loading) return (
		<div className="loading-state">
			<div className="loading-dots"><span /><span /><span /></div>
			<p style={{ color: 'var(--gray-400)', marginTop: 16 }}>กำลังโหลด...</p>
		</div>
	);

	return (
		<div style={{ maxWidth: 800, margin: '0 auto' }}>

			<div className="page-header">
				<h1 className="page-header__title">📅 การจองของฉัน</h1>
				<p className="page-header__sub">รายการจองงานแต่งงานทั้งหมดของคุณ</p>
			</div>

			{bookings.length === 0 ? (
				<div className="empty-state">
					<div className="empty-state__icon">💍</div>
					<p className="empty-state__title">ยังไม่มีการจอง</p>
					<p className="empty-state__desc">เริ่มค้นหาสถานที่และจองได้เลย</p>
					<button onClick={() => navigate('/search')}
						style={{
							marginTop: 20, padding: '12px 28px',
							background: 'linear-gradient(135deg, #f9a8c9, #ec4899)',
							color: 'white', border: 'none', borderRadius: 12,
							fontWeight: 700, cursor: 'pointer', fontSize: 14,
						}}>
						🔍 ค้นหาสถานที่
					</button>
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					{bookings.map(booking => {
						const status = STATUS_MAP[booking.status] || STATUS_MAP.pending;
						const installment = booking.status === 'deposit2_pending' ? 2 : 1;
						const deposit2Deadline = new Date(booking.eventDate);
						deposit2Deadline.setDate(deposit2Deadline.getDate() + 7);
						const isDeadlinePassed = installment === 2 && new Date() > deposit2Deadline;
						const canPay = ['pending', 'deposit1_pending', 'deposit2_pending'].includes(booking.status) && !isDeadlinePassed;

						return (
							<div key={booking._id} style={{
								background: 'white', borderRadius: 20,
								border: '1px solid var(--gray-100)',
								overflow: 'hidden',
								boxShadow: '0 2px 12px rgba(249,168,201,0.08)',
							}}>
								{/* Card Header */}
								<div style={{
									padding: '16px 24px',
									background: 'linear-gradient(135deg, #fdf2f8, #fff)',
									borderBottom: '1px solid var(--gray-100)',
									display: 'flex', justifyContent: 'space-between', alignItems: 'center',
								}}>
									<div>
										<div style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>
											🏛️ {booking.venueId?.name || booking.venueName || 'สถานที่จัดงาน'}
										</div>
										<div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
											📍 {booking.venueId?.province || '-'}
										</div>
									</div>
									<div style={{
										padding: '6px 14px', borderRadius: 999,
										background: status.bg, color: status.color,
										fontSize: 12, fontWeight: 700,
									}}>
										{status.label}
									</div>
								</div>

								{/* Card Body */}
								<div style={{ padding: '20px 24px' }}>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>📅 วันจัดงาน</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{new Date(booking.eventDate).toLocaleDateString('th-TH', {
													year: 'numeric', month: 'long', day: 'numeric'
												})}
											</div>
										</div>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>👥 จำนวนแขก</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{booking.guestCount?.toLocaleString()} คน
											</div>
										</div>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>🍽️ รูปแบบอาหาร</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{booking.mealType === 'buffet' ? 'บุฟเฟต์' : 'โต๊ะจีน'}
											</div>
										</div>
									</div>

									{/* Price */}
									<div style={{
										background: 'var(--pink-bg)', borderRadius: 12,
										padding: '14px 18px', marginBottom: 16,
										display: 'flex', justifyContent: 'space-between', alignItems: 'center',
									}}>
										<div>
											<div style={{ fontSize: 12, color: 'var(--gray-500)' }}>ยอดรวมทั้งหมด</div>
											<div style={{ fontSize: 20, fontWeight: 800, color: 'var(--pink)' }}>
												฿{booking.totalPrice?.toLocaleString()}
											</div>
										</div>
										<div style={{ textAlign: 'right' }}>
											<div style={{ fontSize: 12, color: 'var(--gray-500)' }}>มัดจำที่ต้องชำระ</div>
											<div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>
												฿{booking.depositAmount?.toLocaleString()}
											</div>
										</div>
									</div>

									{/* Rejection banner */}
									{booking.rejectionNote && canPay && (
										<div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: 600, background: '#fff5f5', border: '1px solid #fca5a5', color: '#dc2626' }}>
											⚠️ สลิปถูกปฏิเสธ: {booking.rejectionNote} — กรุณาส่งสลิปใหม่
										</div>
									)}

									{/* Deposit 2 deadline */}
									{booking.status === 'deposit2_pending' && (
										<div style={{ fontSize: 12, color: isDeadlinePassed ? '#dc2626' : '#d97706', marginBottom: 10, fontWeight: 600 }}>
											{isDeadlinePassed
												? `⛔ หมดเวลาชำระงวด 2 แล้ว (ครบกำหนด ${deposit2Deadline.toLocaleDateString('th-TH')})`
												: `⚠️ กรุณาชำระงวด 2 ภายใน ${deposit2Deadline.toLocaleDateString('th-TH')} (7 วันหลังจบพิธี)`
											}
										</div>
									)}

									{canPay && (
										<button
											onClick={() => navigate(`/payment?bookingId=${booking._id}&installment=${installment}&amount=${installment === 2 ? booking.remainingAmount : booking.depositAmount}`)}
											style={{
												width: '100%', padding: '14px',
												background: booking.rejectionNote
													? 'linear-gradient(135deg, #fca5a5, #ef4444)'
													: 'linear-gradient(135deg, #f9a8c9, #ec4899)',
												color: 'white', border: 'none', borderRadius: 12,
												fontWeight: 700, fontSize: 14, cursor: 'pointer',
												boxShadow: booking.rejectionNote
													? '0 4px 12px rgba(239,68,68,0.3)'
													: '0 4px 12px rgba(236,72,153,0.3)',
											}}>
											{booking.rejectionNote ? '🔄 ส่งสลิปใหม่' : `💳 ชำระเงินมัดจำ งวดที่ ${installment}`}
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default MyBookingsPage;