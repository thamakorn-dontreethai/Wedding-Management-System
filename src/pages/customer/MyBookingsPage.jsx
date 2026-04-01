import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_MAP = {
	pending:          { label: 'Awaiting Deposit (Installment 1)', color: '#d97706', bg: '#fffbeb' },
	deposit1_pending: { label: 'Awaiting Deposit (Installment 1)', color: '#d97706', bg: '#fffbeb' },
	deposit1_paid:    { label: 'Installment 1 Paid — Pending Approval', color: '#2563eb', bg: '#eff6ff' },
	deposit2_pending: { label: 'Awaiting Installment 2', color: '#7c3aed', bg: '#f5f3ff' },
	deposit2_paid:    { label: 'Installment 2 Paid — Pending Approval', color: '#2563eb', bg: '#eff6ff' },
	confirmed:        { label: '✅ Confirmed', color: '#16a34a', bg: '#f0fdf4' },
	completed:        { label: '🎉 Completed', color: '#16a34a', bg: '#f0fdf4' },
	cancelled:        { label: '❌ Cancelled', color: '#dc2626', bg: '#fff5f5' },
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
			<p style={{ color: 'var(--gray-400)', marginTop: 16 }}>Loading...</p>
		</div>
	);

	return (
		<div style={{ maxWidth: 800, margin: '0 auto' }}>

			<div className="page-header">
				<h1 className="page-header__title">📅 My Bookings</h1>
				<p className="page-header__sub">All your wedding bookings</p>
			</div>

			{bookings.length === 0 ? (
				<div className="empty-state">
					<div className="empty-state__icon">💍</div>
					<p className="empty-state__title">No bookings yet</p>
					<p className="empty-state__desc">Find a venue and start booking your special day</p>
					<button onClick={() => navigate('/search')}
						style={{
							marginTop: 20, padding: '12px 28px',
							background: 'linear-gradient(135deg, #f9a8c9, #ec4899)',
							color: 'white', border: 'none', borderRadius: 12,
							fontWeight: 700, cursor: 'pointer', fontSize: 14,
						}}>
						🔍 Search Venues
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
								<div style={{
									padding: '16px 24px',
									background: 'linear-gradient(135deg, #fdf2f8, #fff)',
									borderBottom: '1px solid var(--gray-100)',
									display: 'flex', justifyContent: 'space-between', alignItems: 'center',
								}}>
									<div>
										<div style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>
											🏛️ {booking.venueId?.name || booking.venueName || 'Wedding Venue'}
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

								<div style={{ padding: '20px 24px' }}>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>📅 Event Date</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{new Date(booking.eventDate).toLocaleDateString('en-US', {
													year: 'numeric', month: 'long', day: 'numeric'
												})}
											</div>
										</div>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>👥 Guest Count</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{booking.guestCount?.toLocaleString()} guests
											</div>
										</div>
										<div>
											<div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 4 }}>🍽️ Meal Type</div>
											<div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
												{booking.mealType === 'buffet' ? 'Buffet' : 'Chinese Banquet'}
											</div>
										</div>
									</div>

									{booking.packageId && (
										<div style={{ padding: '10px 12px', borderRadius: 10, background: '#fff7fb', border: '1px solid #fbcfe8', fontSize: 13, fontWeight: 600, color: '#be185d', marginBottom: 12 }}>
											📦 Package: {booking.packageId?.name || 'Selected Package'}
										</div>
									)}

									<div style={{ background: 'var(--pink-bg)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<div>
											<div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total Amount</div>
											<div style={{ fontSize: 20, fontWeight: 800, color: 'var(--pink)' }}>
												฿{booking.totalPrice?.toLocaleString()}
											</div>
										</div>
										<div style={{ textAlign: 'right' }}>
											<div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Deposit Due</div>
											<div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>
												฿{booking.depositAmount?.toLocaleString()}
											</div>
										</div>
									</div>

									{booking.rejectionNote && canPay && (
										<div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: 600, background: '#fff5f5', border: '1px solid #fca5a5', color: '#dc2626' }}>
											⚠️ Slip rejected: {booking.rejectionNote} — Please resubmit your slip.
										</div>
									)}

									{booking.status === 'deposit2_pending' && (
										<div style={{ fontSize: 12, color: isDeadlinePassed ? '#dc2626' : '#d97706', marginBottom: 10, fontWeight: 600 }}>
											{isDeadlinePassed
												? `⛔ Installment 2 deadline has passed (due ${deposit2Deadline.toLocaleDateString('en-US')})`
												: `⚠️ Please pay installment 2 by ${deposit2Deadline.toLocaleDateString('en-US')} (7 days after event)`
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
											{booking.rejectionNote ? '🔄 Resubmit Slip' : `💳 Pay Installment ${installment}`}
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
