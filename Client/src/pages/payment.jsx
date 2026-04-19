import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './payment.css';

/** Razorpay test UPI — mock checkout only succeeds when user enters this ID */
const MOCK_UPI_SUCCESS = 'success@razorpay';

function getStoredAuthToken() {
  const raw = sessionStorage.getItem('token');
  if (!raw) return '';
  return raw.trim();
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const resort = location.state?.resort;
  const room = location.state?.room;

  const checkInState = location.state?.checkIn || '';
  const checkOutState = location.state?.checkOut || '';
  const guestsState = location.state?.guests || 2;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: checkInState,
    checkOut: checkOutState,
    guests: guestsState,
  });

  const currentGuests = parseInt(formData.guests) || 1;
  const maxRoomGuests = room?.maxGuests || 2;
  const availableRoomsCount =
    room?.availableInventory ?? room?.inventoryCount ?? 5;
  const maxAllowedGuests = availableRoomsCount * maxRoomGuests;
  const requiredRooms = Math.ceil(currentGuests / maxRoomGuests);

  const handleGuestsChange = (delta, e) => {
    if (e) e.preventDefault();
    setFormData(prev => {
      const newGuests = Math.max(1, Math.min(maxAllowedGuests, parseInt(prev.guests) + delta));
      return { ...prev, guests: newGuests };
    });
  };

  const [extras, setExtras] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    bbq: 0,
    spa: false,
    massage: false,
    fitness: false,
    cabana: false,
    earlyCheckIn: false,
    lateCheckOut: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [showMockUpi, setShowMockUpi] = useState(false);
  const [mockUpiInput, setMockUpiInput] = useState('');
  const [mockModalError, setMockModalError] = useState('');
  const [currentMockOrder, setCurrentMockOrder] = useState(null);
  const [currentMockBooking, setCurrentMockBooking] = useState(null);

  const handleMockSuccess = async () => {
    try {
      setMockModalError('');
      setIsProcessing(true);
      const token = getStoredAuthToken();
      const verifyRes = await fetch(`http://${window.location.hostname}:5000/api/payments/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: currentMockOrder.id,
          razorpay_payment_id: "pay_MOCK_" + Date.now(),
          razorpay_signature: "mock_signature_for_testing",
          bookingId: currentMockBooking
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Payment verification failed.");
      }
      alert("Payment successful. Booking confirmed via UPI.");
      navigate("/bookings");
    } catch (err) {
      setMockModalError(err.message || "Mock verification failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMockConfirm = () => {
    setMockModalError('');
    const entered = mockUpiInput.trim().toLowerCase();
    if (!entered) {
      setMockModalError('Please enter your UPI ID.');
      return;
    }
    if (entered !== MOCK_UPI_SUCCESS.toLowerCase()) {
      setMockModalError('Invalid UPI ID or payment could not be completed. Please check and try again.');
      return;
    }
    handleMockSuccess();
  };

  const updateExtraQuantity = (extraName, delta, e) => {
    e.stopPropagation();
    setExtras(prev => ({ ...prev, [extraName]: Math.max(0, prev[extraName] + delta) }));
  };

  const toggleExtra = (extraName, e) => {
    e.stopPropagation();
    setExtras(prev => ({ ...prev, [extraName]: !prev[extraName] }));
  };

  const extraPrices = {
    breakfast: 500,
    lunch: 800,
    dinner: 1200,
    bbq: 1500,
    spa: 2000,
    massage: 2500,
    fitness: 1000,
    cabana: 3000,
    earlyCheckIn: 2000,
    lateCheckOut: 2000
  };

  const serviceConfig = [
    { id: 'breakfast', type: 'qty', title: 'Buffet Breakfast', desc: 'Fresh international buffet & live counters', priceLabel: '+₹500 / pax / day' },
    { id: 'lunch', type: 'qty', title: 'Premium Lunch', desc: 'A la carte luxury dining experience', priceLabel: '+₹800 / pax / day' },
    { id: 'dinner', type: 'qty', title: 'Gourmet Dinner', desc: 'Exquisite multi-course evening meals', priceLabel: '+₹1200 / pax / day' },
    { id: 'bbq', type: 'qty', title: 'Evening BBQ & Bonfire', desc: 'Private bonfire grilling experience', priceLabel: '+₹1500 / pax' },
    { id: 'spa', type: 'toggle', title: 'Spa & Wellness Access', desc: 'Unlimited access to saunas and thermal pools', priceLabel: '+₹2000 flat fee' },
    { id: 'massage', type: 'toggle', title: 'In-Room Massage Therapy', desc: '60-minute full body relaxing massage', priceLabel: '+₹2500 flat fee' },
    { id: 'fitness', type: 'toggle', title: 'Fitness Center & Yoga', desc: 'Unlimited gym access & sunrise yoga classes', priceLabel: '+₹1000 flat fee' },
    { id: 'cabana', type: 'toggle', title: 'Poolside Cabana', desc: 'Reserved luxury cabana for your entire stay', priceLabel: '+₹3000 flat fee' },
    { id: 'earlyCheckIn', type: 'toggle', title: 'Guaranteed Early Check-in', desc: 'Access your room from 9:00 AM', priceLabel: '+₹2000 flat fee' },
    { id: 'lateCheckOut', type: 'toggle', title: 'Late Check-out Request', desc: 'Keep your room until 4:00 PM', priceLabel: '+₹2000 flat fee' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!resort || !room) {
      navigate('/');
    }
  }, [resort, room, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const cin = new Date(formData.checkIn);
    const cout = new Date(formData.checkOut);
    const nights = (cout - cin) / (1000 * 60 * 60 * 24);
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();

  const calculateSubtotal = () => {
    if (nights <= 0) return 0;
    return nights * requiredRooms * (room?.basePrice || 0);
  };

  const calculateExtrasTotal = () => {
    let total = 0;
    const stayNights = nights || 1;
    const guestCount = parseInt(formData.guests) || 1;

    // Quantity based
    if (extras.breakfast > 0) total += extraPrices.breakfast * stayNights * extras.breakfast;
    if (extras.lunch > 0) total += extraPrices.lunch * stayNights * extras.lunch;
    if (extras.dinner > 0) total += extraPrices.dinner * stayNights * extras.dinner;
    if (extras.bbq > 0) total += extraPrices.bbq * extras.bbq; // one time flat per pax

    // Toggle based (Flat fee)
    if (extras.spa) total += extraPrices.spa;
    if (extras.massage) total += extraPrices.massage;
    if (extras.fitness) total += extraPrices.fitness;
    if (extras.cabana) total += extraPrices.cabana;
    if (extras.earlyCheckIn) total += extraPrices.earlyCheckIn;
    if (extras.lateCheckOut) total += extraPrices.lateCheckOut;


    return total;
  };

  const subtotal = calculateSubtotal();
  const extrasTotal = calculateExtrasTotal();
  const taxes = (subtotal + extrasTotal) * 0.18;
  const totalAmount = subtotal + extrasTotal + Math.round(taxes);

  const loadRazorpayCore = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getSelectedAddonsArray = () => {
    const arr = [];
    const stayNights = nights || 1;
    if (extras.breakfast > 0) arr.push({ title: 'Breakfast', price: extraPrices.breakfast * stayNights, quantity: extras.breakfast });
    if (extras.lunch > 0) arr.push({ title: 'Lunch', price: extraPrices.lunch * stayNights, quantity: extras.lunch });
    if (extras.dinner > 0) arr.push({ title: 'Dinner', price: extraPrices.dinner * stayNights, quantity: extras.dinner });
    if (extras.bbq > 0) arr.push({ title: 'BBQ Bonfire', price: extraPrices.bbq, quantity: extras.bbq });
    if (extras.spa) arr.push({ title: 'Spa Access', price: extraPrices.spa, quantity: 1 });
    if (extras.massage) arr.push({ title: 'In-Room Massage', price: extraPrices.massage, quantity: 1 });
    if (extras.fitness) arr.push({ title: 'Fitness & Yoga', price: extraPrices.fitness, quantity: 1 });
    if (extras.cabana) arr.push({ title: 'Poolside Cabana', price: extraPrices.cabana, quantity: 1 });
    if (extras.earlyCheckIn) arr.push({ title: 'Early Check-In', price: extraPrices.earlyCheckIn, quantity: 1 });
    if (extras.lateCheckOut) arr.push({ title: 'Late Check-Out', price: extraPrices.lateCheckOut, quantity: 1 });
    return arr;
  };

  const createDraftBooking = async (token) => {
    const checkoutRes = await fetch(`http://${window.location.hostname}:5000/api/bookings/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resortId: resort._id,
        roomTypeTitle: room.title,
        quantity: requiredRooms,
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        totalGuests: parseInt(formData.guests, 10) || 1,
        guestName: `${formData.firstName} ${formData.lastName}`.trim(),
        guestEmail: formData.email,
        guestPhone: formData.phone,
        addons: getSelectedAddonsArray(),
      }),
    });

    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) {
      throw new Error(checkoutData.message || "Unable to lock room for booking.");
    }

    const bookingId = checkoutData.booking?._id;
    if (!bookingId) {
      throw new Error("Booking lock created but booking id missing.");
    }
    return bookingId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (nights <= 0 || !room?.title || !resort?._id) {
      setPaymentError("Please select valid stay details before payment.");
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      navigate("/login", { state: { from: "/payment", message: "Please login first" } });
      return;
    }

    try {
      setIsProcessing(true);

      const bookingId = await createDraftBooking(token);

      const orderRes = await fetch(`http://${window.location.hostname}:5000/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          bookingId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Unable to initialize payment.");
      }

      if (orderData.order?.id && orderData.order.id.startsWith("order_MOCK")) {
        setCurrentMockOrder(orderData.order);
        setCurrentMockBooking(bookingId);
        setMockUpiInput('');
        setMockModalError('');
        setShowMockUpi(true);
        setIsProcessing(false);
        return;
      }

      const isScriptLoaded = await loadRazorpayCore();
      if (!isScriptLoaded) {
        throw new Error("Could not load Razorpay SDK.");
      }

      if (!orderData.order?.id) {
        throw new Error("Invalid order response from server.");
      }

      const razorpayKeyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) throw new Error("Razorpay key missing. Please configure payment keys.");

      const options = {
        key: razorpayKeyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: resort?.name || "Booking",
        description: `Booking for ${room?.title || "Room"}`,
        order_id: orderData.order.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#f7a02d" },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }]
              }
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false }
          }
        },
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await fetch(`http://${window.location.hostname}:5000/api/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...paymentResponse, bookingId }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }
            alert("Payment successful. Booking confirmed.");
            navigate("/bookings");
          } catch (err) {
            setPaymentError(err.message || "Payment done but verification failed.");
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const razorpayObj = new window.Razorpay(options);
      razorpayObj.on("payment.failed", function (resp) {
        setPaymentError(resp?.error?.description || "Payment failed.");
        setIsProcessing(false);
      });
      razorpayObj.open();
    } catch (err) {
      setPaymentError(err.message || "Payment could not be started.");
      setIsProcessing(false);
    }
  };


  if (!resort || !room) return null;

  return (
    <div className="payment-page">
      <div className="payment-minimal-header">
        <Link to={`/resort/${resort._id}`} className="payment-back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Resort
        </Link>
        <div className="payment-logo-min">H<span>RESORT</span></div>
      </div>

      <form id="checkout-form" onSubmit={handleSubmit}>
        <div className="payment-layout">

          {/* Main Content */}
          <div className="payment-main">

            <div className="payment-header">
              <h1>Complete Your Booking</h1>
              <p>You're almost there! Fill in your details to secure your stay at {resort.name}.</p>
            </div>


            <div className="payment-form-section">
              <h2>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Guest Information
              </h2>
              <div className="form-grid">
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Enter First Name" />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Enter Last Name" />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter Your Email" />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Enter Your Phone Number" />
                </div>
              </div>
            </div>

            <div className="payment-form-section">
              <h2>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Stay Details
              </h2>
              <div className="form-grid">
                <div className="input-group">
                  <label>Check-in Date</label>
                  <input type="date" name="checkIn" value={formData.checkIn} onChange={handleInputChange} min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="input-group">
                  <label>Check-out Date</label>
                  <input type="date" name="checkOut" value={formData.checkOut} onChange={handleInputChange} min={formData.checkIn || new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="input-group">
                  <label>Number of Guests</label>
                  <div className="guest-qty-selector">
                    <button type="button" onClick={(e) => handleGuestsChange(-1, e)} disabled={currentGuests <= 1}>-</button>
                    <span>{currentGuests}</span>
                    <button type="button" onClick={(e) => handleGuestsChange(1, e)} disabled={currentGuests >= maxAllowedGuests}>+</button>
                  </div>
                  <div className="room-requirement-note">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Requires {requiredRooms} room{requiredRooms > 1 ? 's' : ''} out of {availableRoomsCount} available.
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-policies">
              <h2>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Important Policies
              </h2>
              <ul className="policy-list">
                <li className="policy-item">
                  <div className="policy-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                  <div className="policy-text">
                    <h4>Cancellation Policy</h4>
                    <p>Free cancellation up to 48 hours before check-in. Cancellations made within 48 hours will incur a 1-night penalty.</p>
                  </div>
                </li>
                <li className="policy-item">
                  <div className="policy-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  <div className="policy-text">
                    <h4>Check-in / Check-out</h4>
                    <p>Standard check-in is at 2:00 PM and check-out is at 11:00 AM local time.</p>
                  </div>
                </li>
                <li className="policy-item">
                  <div className="policy-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                  <div className="policy-text">
                    <h4>Identification Required</h4>
                    <p>A valid government-issued photo ID is required for all guests upon formal check-in.</p>
                  </div>
                </li>
                <li className="policy-item">
                  <div className="policy-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
                  <div className="policy-text">
                    <h4>House Rules</h4>
                    <p>Smoking is strictly prohibited inside the rooms. Damage to property will be billed to your registered payment method.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Sidebar Summary */}
          <div className="payment-sidebar" style={{ position: 'sticky', top: '40px', height: 'max-content' }}>
            <div className="invoice-sidebar">
              <div className="invoice-resort-info">
                <img src={room.images?.[0] || resort.images?.[0]} alt="Room Preview" />
                <div className="inv-r-details">
                  <h3>{resort.name}</h3>
                  <p>{resort.location?.city || "Location"}</p>
                  <div className="room-badge">{room.title}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#111' }}>Price Details</h3>

              <div className="invoice-summary-row">
                <span>₹{room.basePrice.toLocaleString()} x {requiredRooms} room{requiredRooms > 1 && 's'} x {nights > 0 ? nights : 1} night{nights > 1 && 's'}</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {extras.breakfast > 0 && (
                <div className="invoice-summary-row extra-item">
                  <span>Breakfast ({extras.breakfast} pax)</span>
                  <span>₹{(extraPrices.breakfast * (nights || 1) * extras.breakfast).toLocaleString()}</span>
                </div>
              )}
              {extras.lunch > 0 && (
                <div className="invoice-summary-row extra-item">
                  <span>Lunch ({extras.lunch} pax)</span>
                  <span>₹{(extraPrices.lunch * (nights || 1) * extras.lunch).toLocaleString()}</span>
                </div>
              )}
              {extras.dinner > 0 && (
                <div className="invoice-summary-row extra-item">
                  <span>Dinner ({extras.dinner} pax)</span>
                  <span>₹{(extraPrices.dinner * (nights || 1) * extras.dinner).toLocaleString()}</span>
                </div>
              )}
              {extras.bbq > 0 && (
                <div className="invoice-summary-row extra-item">
                  <span>BBQ Bonfire ({extras.bbq} pax)</span>
                  <span>₹{(extraPrices.bbq * extras.bbq).toLocaleString()}</span>
                </div>
              )}
              {extras.spa && (
                <div className="invoice-summary-row extra-item">
                  <span>Spa Access</span>
                  <span>₹{extraPrices.spa.toLocaleString()}</span>
                </div>
              )}
              {extras.massage && (
                <div className="invoice-summary-row extra-item">
                  <span>In-Room Massage</span>
                  <span>₹{extraPrices.massage.toLocaleString()}</span>
                </div>
              )}
              {extras.fitness && (
                <div className="invoice-summary-row extra-item">
                  <span>Fitness & Yoga</span>
                  <span>₹{extraPrices.fitness.toLocaleString()}</span>
                </div>
              )}
              {extras.cabana && (
                <div className="invoice-summary-row extra-item">
                  <span>Poolside Cabana</span>
                  <span>₹{extraPrices.cabana.toLocaleString()}</span>
                </div>
              )}
              {extras.earlyCheckIn && (
                <div className="invoice-summary-row extra-item">
                  <span>Early Check-In</span>
                  <span>₹{extraPrices.earlyCheckIn.toLocaleString()}</span>
                </div>
              )}
              {extras.lateCheckOut && (
                <div className="invoice-summary-row extra-item">
                  <span>Late Check-Out</span>
                  <span>₹{extraPrices.lateCheckOut.toLocaleString()}</span>
                </div>
              )}

              <div className="invoice-divider"></div>

              <div className="invoice-summary-row">
                <span>Subtotal</span>
                <span>₹{(subtotal + extrasTotal).toLocaleString()}</span>
              </div>
              <div className="invoice-summary-row">
                <span>Taxes & Fees (18%)</span>
                <span>₹{Math.round(taxes).toLocaleString()}</span>
              </div>

              <div className="invoice-divider"></div>

              <div className="invoice-total">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>

              <button type="submit" className="checkout-btn" disabled={subtotal === 0 || isProcessing}>
                Proceed to Payment
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              {isProcessing && (
                <p style={{ color: "#92400e", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>
                  Initializing secure payment...
                </p>
              )}
              {paymentError && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>
                  {paymentError}
                </p>
              )}
              {(nights <= 0 || !formData.checkIn || !formData.checkOut) && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '15px', textAlign: 'center' }}>Please select valid dates to continue</p>
              )}

              <div className="trust-badges">
                <div className="trust-badge">
                  <div className="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div className="trust-content">
                    <h4>Secure Booking</h4>
                    <p>Your payment is processed by Razorpay with secure encryption.</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="trust-content">
                    <h4>Instant Confirmation</h4>
                    <p>Your booking is instantly confirmed directly with the property.</p>
                  </div>
                </div>
              </div></div>
          </div>

        </div>

        {/* Full Width Add-ons Section Below */}
        <div className="payment-addons-container" style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 5%' }}>
          <div className="payment-form-section" style={{ marginBottom: '0' }}>
            <h2>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Enhance Your Stay (Add-on Services)
            </h2>
            <div className="extras-grid full-width">
              {serviceConfig.map(svc => (
                <div key={svc.id} className={`extra-card ${extras[svc.id] ? 'selected' : ''}`}>
                  <div className="extra-card-header">
                    <div>
                      <h3 className="extra-card-title">{svc.title}</h3>
                      <p className="extra-card-desc">{svc.desc}</p>
                    </div>
                  </div>
                  <div className="extra-card-footer">
                    <div className="extra-price-tag">{svc.priceLabel}</div>
                    <div style={{ width: svc.type === 'qty' ? '110px' : '90px' }}>
                      {svc.type === 'qty' ? (
                        extras[svc.id] === 0 ? (
                          <button type="button" className="add-service-btn" onClick={(e) => updateExtraQuantity(svc.id, 1, e)}>Add</button>
                        ) : (
                          <div className="extra-qty-controls">
                            <button type="button" onClick={(e) => updateExtraQuantity(svc.id, -1, e)}>-</button>
                            <span>{extras[svc.id]}</span>
                            <button type="button" onClick={(e) => updateExtraQuantity(svc.id, 1, e)}>+</button>
                          </div>
                        )
                      ) : (
                        !extras[svc.id] ? (
                          <button type="button" className="add-service-btn" onClick={(e) => toggleExtra(svc.id, e)}>Add</button>
                        ) : (
                          <button type="button" className="add-service-btn added" onClick={(e) => toggleExtra(svc.id, e)}>Added ✓</button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {showMockUpi && (
        <div className="upi-mock-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="upi-mock-modal" style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '46px', color: '#0f172a', lineHeight: '1' }}>H</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', color: '#0f172a', marginTop: '6px' }}>RESORT</span>
            </div>
            <h2 style={{ marginBottom: '10px', color: '#111' }}>Pay via UPI</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Secure Fast Checkout</p>

            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Amount to Pay</p>
              <h3 style={{ margin: '5px 0 0', fontSize: '24px', color: '#111' }}>₹{(currentMockOrder?.amount / 100)?.toLocaleString()}</h3>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label htmlFor="mock-upi-input" style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>UPI ID</label>
              <input
                id="mock-upi-input"
                type="text"
                value={mockUpiInput}
                onChange={(e) => {
                  setMockUpiInput(e.target.value);
                  if (mockModalError) setMockModalError('');
                }}
                placeholder="Enter your UPI ID"
                autoComplete="off"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', color: '#111', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {mockModalError && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>{mockModalError}</p>
            )}

            <button
              type="button"
              onClick={handleMockConfirm}
              disabled={isProcessing}
              style={{ width: '100%', padding: '14px', background: '#f7a02d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: isProcessing ? 'not-allowed' : 'pointer', marginBottom: '10px', opacity: isProcessing ? 0.85 : 1 }}
            >
              {isProcessing ? 'Confirming…' : 'Confirm payment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMockUpi(false);
                setMockUpiInput('');
                setMockModalError('');
                setPaymentError('Payment cancelled.');
              }}
              style={{ width: '100%', padding: '14px', background: 'transparent', color: '#666', border: 'none', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
