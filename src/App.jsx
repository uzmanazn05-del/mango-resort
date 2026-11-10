
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  CreditCard,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock,
  Wallet,
  Hotel,
  Waves,
  ArrowDownRight,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  Sparkles
} from "lucide-react";

import "./App.css";

/* =========================================
   NAVIGATION
========================================= */

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", icon: Users },
  { name: "Rooms", icon: BedDouble },
  { name: "Bookings", icon: CalendarDays },
  { name: "Services", icon: Sparkles },
  { name: "Billing & Invoices", icon: Receipt },
  { name: "Payments", icon: CreditCard },
];

/* =========================================
   DASHBOARD SAMPLE DATA
========================================= */

const bookings = [
  {
    id: "BK-1024",
    name: "Rahul Sharma",
    initials: "RS",
    room: "Deluxe Cottage",
    checkin: "04 Nov 2026",
    checkout: "06 Nov 2026",
    amount: "₹8,500",
    status: "Checked in"
  },
  {
    id: "BK-1025",
    name: "Ayesha Khan",
    initials: "AK",
    room: "Premium Suite",
    checkin: "04 Nov 2026",
    checkout: "05 Nov 2026",
    amount: "₹6,000",
    status: "Confirmed"
  },
  {
    id: "BK-1026",
    name: "Arjun Reddy",
    initials: "AR",
    room: "Standard Room",
    checkin: "05 Nov 2026",
    checkout: "07 Nov 2026",
    amount: "₹5,000",
    status: "Pending"
  },
  {
    id: "BK-1027",
    name: "Priya Sharma",
    initials: "PS",
    room: "Pool Villa",
    checkin: "05 Nov 2026",
    checkout: "08 Nov 2026",
    amount: "₹15,000",
    status: "Confirmed"
  }
];

const transactions = [
  {
    name: "Rahul Sharma",
    type: "Room booking",
    method: "UPI",
    amount: "+₹8,500",
    time: "10:42 AM",
    initials: "RS"
  },
  {
    name: "Ayesha Khan",
    type: "Advance payment",
    method: "Card",
    amount: "+₹3,000",
    time: "11:15 AM",
    initials: "AK"
  },
  {
    name: "Arjun Reddy",
    type: "Restaurant",
    method: "Cash",
    amount: "+₹1,200",
    time: "12:30 PM",
    initials: "AR"
  }
];

const stats = [
  {
    label: "Total revenue",
    value: "₹2,45,800",
    change: "+12.5%",
    note: "Compared with last month",
    icon: Wallet,
    tone: "gold"
  },
  {
    label: "Total bookings",
    value: "128",
    change: "+8.2%",
    note: "Compared with last month",
    icon: CalendarDays,
    tone: "sage"
  },
  {
    label: "Available rooms",
    value: "18 / 50",
    change: "36% available",
    note: "Across all room categories",
    icon: BedDouble,
    tone: "blue"
  },
  {
    label: "Pending payments",
    value: "₹18,500",
    change: "Needs attention",
    note: "Outstanding balance",
    icon: Clock,
    tone: "clay"
  }
];

/* =========================================
   ROOMS SAMPLE DATA
========================================= */

const initialRooms = [
  {
    id: 1,
    number: "101",
    name: "Deluxe Cottage",
    category: "Deluxe",
    price: 4500,
    capacity: 2,
    status: "Available"
  },
  {
    id: 2,
    number: "102",
    name: "Premium Suite",
    category: "Premium",
    price: 6500,
    capacity: 3,
    status: "Occupied"
  },
  {
    id: 3,
    number: "103",
    name: "Pool Villa",
    category: "Villa",
    price: 9500,
    capacity: 4,
    status: "Available"
  },
  {
    id: 4,
    number: "104",
    name: "Standard Room",
    category: "Standard",
    price: 3000,
    capacity: 2,
    status: "Maintenance"
  },
  {
    id: 5,
    number: "105",
    name: "Deluxe Cottage",
    category: "Deluxe",
    price: 4500,
    capacity: 2,
    status: "Occupied"
  },
  {
    id: 6,
    number: "106",
    name: "Premium Suite",
    category: "Premium",
    price: 6500,
    capacity: 3,
    status: "Available"
  }
];

/* =========================================
   ROOMS MANAGEMENT PAGE
========================================= */

function RoomsPage() {
    const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    number: "",
    name: "Standard Room",
    category: "Standard",
    price: "",
    capacity: "2",
    status: "Available"
  });
    useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [roomsResponse, typesResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/rooms/"),
          fetch("http://127.0.0.1:8000/room-types/")
        ]);

        if (!roomsResponse.ok || !typesResponse.ok) {
          throw new Error("Failed to load room data.");
        }

        const roomsData = await roomsResponse.json();
        const typesData = await typesResponse.json();

        const formattedRooms = roomsData.map((room) => ({
          id: room.room_id,
          number: room.room_number,
          name: room.room_type.type_name,
          category: room.room_type.type_name,
          price: Number(room.room_type.base_price),
          capacity: room.room_type.capacity,
          status: room.status,
          roomTypeId: room.room_type_id
        }));

        setRooms(formattedRooms);
        setRoomTypes(typesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      `${room.number} ${room.name}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || room.category === category;

    const matchesStatus =
      status === "All" || room.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const available = rooms.filter(r => r.status === "Available").length;
  const occupied = rooms.filter(r => r.status === "Occupied").length;
  const maintenance = rooms.filter(r => r.status === "Maintenance").length;

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm(previous => ({ ...previous, [name]: value }));

    if (name === "category") {
      const roomNames = {
        Standard: "Standard Room",
        Deluxe: "Deluxe Cottage",
        Premium: "Premium Suite",
        Villa: "Pool Villa"
      };

      setForm(previous => ({
        ...previous,
        category: value,
        name: roomNames[value]
      }));
    }
  };

  const saveRoom = (e) => {
    e.preventDefault();

    if (rooms.some(room => room.number === form.number.trim())) {
      window.alert("This room number already exists.");
      return;
    }

    const newRoom = {
      id: Date.now(),
      number: form.number.trim(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      capacity: Number(form.capacity),
      status: form.status
    };

    setRooms(previous => [...previous, newRoom]);

    setForm({
      number: "",
      name: "Standard Room",
      category: "Standard",
      price: "",
      capacity: "2",
      status: "Available"
    });

    setShowForm(false);
  };

  return (
    <div className="rooms-page">

      <section className="rooms-welcome">
        <div>
          <div className="section-kicker">PROPERTY MANAGEMENT</div>
          <h2>Rooms & Inventory</h2>
          <p>Manage your resort rooms, availability and room categories.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} /> Add new room
        </button>
      </section>

      <section className="room-summary-grid">
        <article className="room-summary-card">
          <span>Total rooms</span>
          <strong>{rooms.length}</strong>
          <small>Registered inventory</small>
        </article>

        <article className="room-summary-card">
          <span>Available</span>
          <strong>{available}</strong>
          <small>Ready for booking</small>
        </article>

        <article className="room-summary-card">
          <span>Occupied</span>
          <strong>{occupied}</strong>
          <small>Currently in use</small>
        </article>

        <article className="room-summary-card">
          <span>Maintenance</span>
          <strong>{maintenance}</strong>
          <small>Temporarily unavailable</small>
        </article>
      </section>

      <section className="surface-card rooms-inventory">

        <div className="rooms-toolbar">
          <div>
            <div className="section-kicker">ROOM DIRECTORY</div>
            <h3>All rooms</h3>
            <p>View and manage your room inventory.</p>
          </div>

          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room number..."
            />
          </label>
        </div>

        <div className="room-filters">
          <label>
            <span>Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Premium">Premium</option>
              <option value="Villa">Villa</option>
            </select>
          </label>

          <label>
            <span>Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table className="booking-table rooms-table">
            <thead>
              <tr>
                <th>ROOM NO.</th>
                <th>ROOM NAME</th>
                <th>CATEGORY</th>
                <th>CAPACITY</th>
                <th>PRICE / NIGHT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredRooms.map(room => (
                <tr key={room.id}>
                  <td className="booking-code">#{room.number}</td>
                  <td className="room-name-cell">{room.name}</td>
                  <td>{room.category}</td>
                  <td>{room.capacity} Guests</td>
                  <td className="amount-cell">
                    ₹{room.price.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`status-pill ${room.status.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No rooms match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rooms-table-footer">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </section>

      {showForm && (
        <div
          className="room-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <section
            className="room-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="room-modal-header">
              <div>
                <div className="section-kicker">ROOM INVENTORY</div>
                <h3>Add a new room</h3>
                <p>Enter the details of your resort room.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveRoom}>
              <div className="room-form-grid">

                <label>
                  Room number *
                  <input
                    name="number"
                    value={form.number}
                    onChange={updateForm}
                    placeholder="e.g. 107"
                    required
                    maxLength={20}
                  />
                </label>

                <label>
                  Room category *
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateForm}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Premium">Premium</option>
                    <option value="Villa">Villa</option>
                  </select>
                </label>

                <label>
                  Room name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    required
                  />
                </label>

                <label>
                  Price per night (₹) *
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={updateForm}
                    placeholder="e.g. 4500"
                    min="1"
                    required
                  />
                </label>

                <label>
                  Guest capacity *
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={updateForm}
                    min="1"
                    max="20"
                    required
                  />
                </label>

                <label>
                  Room status *
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateForm}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>

              </div>

              <div className="room-modal-actions">
                <button
                  type="button"
                  className="filter-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  <Plus size={16} /> Save room
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

/* =========================================
   BOOKINGS MANAGEMENT PAGE
========================================= */

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [form, setForm] = useState({
  customer_id: "",
  room_id: "",
  booking_type: "individual_room",
  check_in: "",
  check_out: "",
  check_in_time: "",
  check_out_time: "",
  guests: 1,
  adults: 1,
  children: 0,
  booking_source: "reception",
  booking_status: "Confirmed"
});
  const API = "http://127.0.0.1:8000";

  // Load bookings and customers
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
        const [bookingResponse, customerResponse, roomResponse] =
            await Promise.all([
          fetch(`${API}/bookings/`),
          fetch(`${API}/customers/`),
          fetch(`${API}/rooms/`)
        ]);

      if (
        !bookingResponse.ok ||
        !customerResponse.ok ||
        !roomResponse.ok
      ) {
      throw new Error("Unable to load bookings, customers or rooms.");
    }

      const bookingData = await bookingResponse.json();
      const customerData = await customerResponse.json();
      const roomData = await roomResponse.json();

      setBookings(bookingData)
      setCustomers(customerData);
      setRooms(roomData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
// Edit booking
const handleEditBooking = (booking) => {
  setEditingBooking(booking);

  setForm({
    customer_id: String(booking.customer_id),
    room_id: booking.room_id ? String(booking.room_id) : "",
    booking_type: booking.booking_type || "individual_room",
    check_in: booking.check_in || "",
    check_out: booking.check_out || "",
    check_in_time: booking.check_in_time || "",
    check_out_time: booking.check_out_time || "",
    guests: booking.guests || 1,
    adults: booking.adults || 1,
    children: booking.children || 0,
    booking_source: booking.booking_source || "reception",
    booking_status: booking.booking_status || "Confirmed"
  });

  setShowForm(true);
};
//Delete booking 

const handleCancelBooking = async (booking) => {
  const confirmed = window.confirm(
    `Are you sure you want to cancel booking BK-${String(
      booking.booking_id
    ).padStart(4, "0")}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API}/bookings/${booking.booking_id}/cancel`,
      {
        method: "POST"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to cancel booking.");
    }

    alert("Booking cancelled successfully!");

    await fetchData();

  } catch (err) {
    alert(err.message);
  }
};


  // Create booking
  const saveBooking = async (e) => {
    e.preventDefault();

    if (!form.customer_id) {
      alert("Please select a customer.");
      return;
    }

    if (form.check_out <= form.check_in) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        editingBooking
    ? `${API}/bookings/${editingBooking.booking_id}`
    : `${API}/bookings/`,
  {
    method: editingBooking ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  ...form,
  customer_id: Number(form.customer_id),
  room_id: form.room_id ? Number(form.room_id) : null,
  guests: Number(form.guests),
  adults: Number(form.adults),
  children: Number(form.children),
  check_in_time: form.check_in_time || null,
  check_out_time: form.check_out_time || null
})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to create booking."
        );
      }

      await response.json();

      alert(
  editingBooking
    ? "Booking updated successfully!"
    : "Booking created successfully!"
);

      setForm({
        customer_id: "",
        check_in: "",
        check_out: "",
        guests: 1,
        booking_source: "Walk-in",
        booking_status: "Confirmed"
      });

      setShowForm(false);
      setEditingBooking(null);
      await fetchData();

    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Search bookings
  const filteredBookings = bookings.filter((booking) => {
    const customer = customers.find(
      (c) => c.customer_id === booking.customer_id
    );

    const customerName = customer?.full_name || "";

    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(booking.booking_id).includes(search)
    );
  });

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (c) => c.customer_id === customerId
    );

    return customer?.full_name || `Customer #${customerId}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const confirmed = bookings.filter(
    (b) => b.booking_status === "Confirmed"
  ).length;

  const pending = bookings.filter(
    (b) => b.booking_status === "Pending"
  ).length;

  return (
    <div className="page-content">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESERVATION MANAGEMENT</p>
          <h1>Bookings</h1>
          <p className="page-subtitle">
            Manage guest reservations and booking details.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} />
          New booking
        </button>
      </div>

      {/* Summary cards */}
      <div className="room-summary-grid">

        <div className="room-summary-card">
          <span>Total bookings</span>
          <strong>{bookings.length}</strong>
        </div>

        <div className="room-summary-card">
          <span>Confirmed</span>
          <strong>{confirmed}</strong>
        </div>

        <div className="room-summary-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

        <div className="room-summary-card">
          <span>Total customers</span>
          <strong>{customers.length}</strong>
        </div>

      </div>

      {/* Bookings table */}
      <div className="table-card">

        <div className="table-toolbar">
          <div>
            <h3>All reservations</h3>
            <p>View and manage guest bookings.</p>
          </div>

          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search customer or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading bookings...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>BOOKING ID</th>
                  <th>CUSTOMER</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>GUESTS</th>
                  <th>SOURCE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>
                        <strong>
                          BK-{String(booking.booking_id).padStart(4, "0")}
                        </strong>
                      </td>

                      <td>
                        {getCustomerName(booking.customer_id)}
                      </td>

                      <td>{formatDate(booking.check_in)}</td>

                      <td>{formatDate(booking.check_out)}</td>

                      <td>{booking.guests}</td>

                      <td>{booking.booking_source}</td>

                      <td>
                        <span className="status-pill">
                          {booking.booking_status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <button type="button" 
                        className="secondary-btn" onClick={() => handleEditBooking(booking)} 
                        disabled={booking.booking_status === "Cancelled"}
                      >
                      Edit
                      </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={() => handleCancelBooking(booking)}
    disabled={booking.booking_status === "Cancelled"}
    style={{ marginLeft: "8px" }}
  >
    Cancel
  </button>
</td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* New booking form */}
      {showForm && (
        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-heading">
              <div>
                <p className="eyebrow">RESERVATION</p>
                <h2>{editingBooking ? "Edit booking" : "Create new booking"}</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveBooking}>

              <div className="form-grid">

                <label>
                  Select customer

                  <select
                    required
                    value={form.customer_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer_id: e.target.value
                      })
                    }
                  >
                    <option value="">Choose customer</option>

                    {customers.map((customer) => (
                      <option
                        key={customer.customer_id}
                        value={customer.customer_id}
                      >
                        {customer.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
  Select room

  <select
    required
    value={form.room_id}
    onChange={(e) =>
      setForm({
        ...form,
        room_id: e.target.value
      })
    }
  >
    <option value="">Choose room</option>

    {rooms
      .filter((room) => room.status !== "Maintenance")
      .map((room) => (
        <option key={room.room_id} value={room.room_id}>
          Room {room.room_number} - {room.room_type.type_name}
        </option>
      ))}
  </select>
</label>

                <label>
                  Number of guests

                  <input
                    type="number"
                    min="1"
                    required
                    value={form.guests}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        guests: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Check-in date

                  <input
                    type="date"
                    required
                    value={form.check_in}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        check_in: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Check-out date

                  <input
                    type="date"
                    required
                    min={form.check_in || undefined}
                    value={form.check_out}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        check_out: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Booking source

                  <select
                    value={form.booking_source}
                    onChange={(e) =>
                    setForm({
                    ...form,
                   booking_source: e.target.value
                })
              }
              >
              <option value="reception">Reception</option>
              <option value="online">Online</option>
              </select>
              </label>

                <label>
                  Booking status

                  <select
                    value={form.booking_status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        booking_status: e.target.value
                      })
                    }
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                  ? "Saving..."
                  : editingBooking
                  ? "Update booking"
                  : "Create booking"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================
   CUSTOMERS MANAGEMENT PAGE
========================================= */

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({
  full_name: "",
  phone: "",
  email: "",
  address: ""
});

  const API = "http://127.0.0.1:8000";

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/customers/`);

      if (!response.ok) {
        throw new Error("Unable to load customers.");
      }

      const data = await response.json();
      setCustomers(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (customer) => {
  setEditingCustomer(customer);

  setForm({
    full_name: customer.full_name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || ""
  });

  setShowForm(true);
};

const saveCustomer = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);

    const url = editingCustomer
      ? `${API}/customers/${editingCustomer.customer_id}`
      : `${API}/customers/`;

    const response = await fetch(url, {
      method: editingCustomer ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Unable to save customer."
      );
    }

    alert(
      editingCustomer
        ? "Customer updated successfully!"
        : "Customer added successfully!"
    );

    setForm({
      full_name: "",
      phone: "",
      email: "",
      address: ""
    });

    setEditingCustomer(null);
    setShowForm(false);

    await fetchCustomers();

  } catch (err) {
    alert(err.message);
  } finally {
    setSaving(false);
  }
};
  const filteredCustomers = customers.filter((customer) =>
    `${customer.full_name} ${customer.phone} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const handleDelete = async (customerId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this customer?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API}/customers/${customerId}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to delete customer.");
    }

    alert("Customer deleted successfully!");

    await fetchCustomers();

  } catch (err) {
    alert(err.message);
  }
};
  return (
    <div className="page-content">
        <div className="page-heading">
    <div>
    <p className="eyebrow">GUEST MANAGEMENT</p>
    <h1>Customers</h1>
    <p className="page-subtitle">
      Manage your resort guests and customer information.
    </p>
  </div>

  <button
    className="primary-btn"
    onClick={() => setShowForm(true)}
  >
    <Plus size={17} />
    Add customer
  </button>
</div>

      <div className="room-summary-grid">
        <div className="room-summary-card">
          <span>Total customers</span>
          <strong>{customers.length}</strong>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>All customers</h3>
            <p>Customer directory and contact details.</p>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading customers...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>FULL NAME</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  <th>ADDRESS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>
                        CUS-{String(customer.customer_id).padStart(4, "0")}
                      </td>
                      <td><strong>{customer.full_name}</strong></td>
                      <td>{customer.phone}</td>
                      <td>{customer.email || "-"}</td>
                      <td>{customer.address || "-"}</td>
                      <td>
                        <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleEdit(customer)}
                        >
                          Edit
                          </button>
                          <button type="button"
                          className="secondary-btn"
                          onClick={() => handleDelete(customer.customer_id)}
                        >
                          Delete
                          </button>
                          </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
  <div className="modal-backdrop">
    <div className="modal-card">
      <div className="modal-heading">
        <div>
          <p className="eyebrow">GUEST MANAGEMENT</p>
          <h2>{editingCustomer ? "Edit customer" : "Add new customer"}
          </h2>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowForm(false)}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={saveCustomer}>
        <div className="form-grid">

          <label>
            Full name *
            <input
              required
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
              placeholder="Enter full name"
            />
          </label>

          <label>
            Phone number *
            <input
              required
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              placeholder="Enter phone number"
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Enter email address"
            />
          </label>

          <label>
            Address
            <input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              placeholder="Enter address"
            />
          </label>

        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-btn"
            disabled={saving}
          >
            {saving
            ? "Saving..."
            : editingCustomer
            ? "Update customer"
            : "Save customer"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

/* =========================================
   SERVICES MANAGEMENT PAGE
========================================= */

function ServicesPage() {
  const API = "http://127.0.0.1:8000";

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingServices, setBookingServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    service_name: "",
    price: "",
    description: "",
    is_active: true,
  });

  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [quantity, setQuantity] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [serviceRes, bookingRes] = await Promise.all([
        fetch(`${API}/services/`),
        fetch(`${API}/bookings/`),
      ]);

      if (!serviceRes.ok || !bookingRes.ok) {
        throw new Error("Unable to load services or bookings.");
      }

      const [serviceData, bookingData] = await Promise.all([
        serviceRes.json(),
        bookingRes.json(),
      ]);

      setServices(serviceData);
      setBookings(
        bookingData.filter(
          (booking) =>
            booking.booking_status?.toLowerCase() !== "cancelled"
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchBookingServices = async (bookingId) => {
    if (!bookingId) {
      setBookingServices([]);
      return;
    }

    try {
      const response = await fetch(
        `${API}/booking-services/${bookingId}`
      );

      if (!response.ok) {
        throw new Error("Unable to load booking services.");
      }

      const data = await response.json();
      setBookingServices(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setForm({
      service_name: "",
      price: "",
      description: "",
      is_active: true,
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);

    setForm({
      service_name: service.service_name,
      price: service.price,
      description: service.description || "",
      is_active: service.is_active ?? true,
    });

    setShowForm(true);
  };

  const saveService = async (e) => {
    e.preventDefault();

    if (!form.service_name.trim() || Number(form.price) <= 0) {
      alert("Enter a valid service name and price.");
      return;
    }

    try {
      setSaving(true);

      const url = editingService
        ? `${API}/services/${editingService.service_id}`
        : `${API}/services/`;

      const response = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_name: form.service_name.trim(),
          price: Number(form.price),
          description: form.description.trim() || null,
          is_active: form.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save service.");
      }

      alert(
        editingService
          ? "Service updated successfully!"
          : "Service added successfully!"
      );

      resetForm();
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceStatus = async (service) => {
    const newStatus = !(service.is_active ?? true);

    const confirmed = window.confirm(
      `${newStatus ? "Activate" : "Deactivate"} ${service.service_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/services/${service.service_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update service.");
      }

      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const addServiceToBooking = async (e) => {
    e.preventDefault();

    if (!selectedBooking || !selectedService) {
      alert("Please select a booking and a service.");
      return;
    }

    const service = services.find(
      (item) => String(item.service_id) === selectedService
    );

    if (!service) {
      alert("Selected service was not found.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/booking-services/${selectedBooking}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: Number(selectedService),
            quantity: Number(quantity),
            unit_price: Number(service.price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to add service to booking.");
      }

      alert("Service added to booking successfully!");

      await fetchBookingServices(selectedBooking);
      setSelectedService("");
      setQuantity(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.service_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active"
        ? service.is_active
        : !service.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = services.filter(
    (service) => service.is_active
  ).length;

  const inactiveCount = services.length - activeCount;

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <p className="eyebrow">RESORT OPERATIONS</p>
          <h1>Services</h1>
          <p className="page-subtitle">
            Manage additional services and attach them to guest bookings.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditingService(null);
            setForm({
              service_name: "",
              price: "",
              description: "",
              is_active: true,
            });
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Add service
        </button>
      </div>

      <div className="room-summary-grid">
        <div className="room-summary-card">
          <span>Total services</span>
          <strong>{services.length}</strong>
        </div>

        <div className="room-summary-card">
          <span>Active services</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="room-summary-card">
          <span>Inactive services</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      {/* SERVICES DIRECTORY */}

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Service directory</h3>
            <p>Manage service names, prices and availability.</p>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="room-filters">
          <label>
            <span>Service status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All services</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading services...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SERVICE</th>
                  <th>DESCRIPTION</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.service_id}>
                      <td>
                        <strong>{service.service_name}</strong>
                      </td>

                      <td>{service.description || "-"}</td>

                      <td>
                        {formatCurrency(service.price)}
                      </td>

                      <td>
                        <span className="status-pill">
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleEdit(service)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="secondary-btn"
                          style={{ marginLeft: "8px" }}
                          onClick={() => toggleServiceStatus(service)}
                        >
                          {service.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD SERVICE TO BOOKING */}

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Add service to a booking</h3>
            <p>Record extra services requested by a guest.</p>
          </div>
        </div>

        <form onSubmit={addServiceToBooking}>
          <div className="form-grid">

            <label>
              Select booking *
              <select
                required
                value={selectedBooking}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedBooking(id);
                  fetchBookingServices(id);
                }}
              >
                <option value="">Choose booking</option>

                {bookings.map((booking) => (
                  <option
                    key={booking.booking_id}
                    value={booking.booking_id}
                  >
                    BK-{String(booking.booking_id).padStart(4, "0")}
                    {" — "}
                    {booking.booking_id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select service *
              <select
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Choose service</option>

                {services
                  .filter((service) => service.is_active)
                  .map((service) => (
                    <option
                      key={service.service_id}
                      value={service.service_id}
                    >
                      {service.service_name} — {formatCurrency(service.price)}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Quantity *
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add to booking"}
            </button>
          </div>
        </form>

        {selectedBooking && (
          <div style={{ marginTop: "24px" }}>
            <h3>Services added to selected booking</h3>

            {bookingServices.length === 0 ? (
              <p className="empty-state">
                No services have been added to this booking yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>SERVICE</th>
                      <th>QUANTITY</th>
                      <th>UNIT PRICE</th>
                      <th>TOTAL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookingServices.map((item) => {
                      const service = services.find(
                        (s) => s.service_id === item.service_id
                      );

                      return (
                        <tr key={item.booking_service_id}>
                          <td>
                            {service?.service_name || `Service #${item.service_id}`}
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price)}</td>
                          <td>
                            {formatCurrency(
                              Number(item.quantity) * Number(item.unit_price)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT SERVICE MODAL */}

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-card">

            <div className="modal-heading">
              <div>
                <p className="eyebrow">SERVICE MANAGEMENT</p>
                <h2>
                  {editingService ? "Edit service" : "Add new service"}
                </h2>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={resetForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveService}>
              <div className="form-grid">

                <label>
                  Service name *
                  <input
                    required
                    minLength="2"
                    maxLength="100"
                    value={form.service_name}
                    onChange={(e) =>
                      setForm({ ...form, service_name: e.target.value })
                    }
                    placeholder="e.g. Campfire"
                  />
                </label>

                <label>
                  Price (₹) *
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 1500"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe this service..."
                  />
                </label>

                <label>
                  Status
                  <select
                    value={String(form.is_active)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>

              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingService
                    ? "Update service"
                    : "Save service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


/* =========================================
   BILLING & INVOICES PAGE
========================================= */

function BillingPage() {
  const API = "http://127.0.0.1:8000";

  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState("");
  const [invoiceType, setInvoiceType] = useState("Final");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [extraItems, setExtraItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingRes, customerRes, invoiceRes, paymentRes] =
        await Promise.all([
          fetch(`${API}/bookings/`),
          fetch(`${API}/customers/`),
          fetch(`${API}/invoices/`),
          fetch(`${API}/payments/`)
        ]);

      if (
        !bookingRes.ok ||
        !customerRes.ok ||
        !invoiceRes.ok ||
        !paymentRes.ok
      ) {
        throw new Error("Unable to load billing data.");
      }

      const [bookingData, customerData, invoiceData, paymentData] =
        await Promise.all([
          bookingRes.json(),
          customerRes.json(),
          invoiceRes.json(),
          paymentRes.json()
        ]);

      setBookings(bookingData);
      setCustomers(customerData);
      setInvoices(invoiceData);
      setPayments(paymentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const booking = bookings.find(
    (b) => String(b.booking_id) === selectedBooking
  );

  const customer = customers.find(
    (c) => c.customer_id === booking?.customer_id
  );

  const bookingInvoices = invoices.filter(
    (invoice) => invoice.booking_id === booking?.booking_id
  );

  const existingFinalInvoice = bookingInvoices.some(
    (invoice) => invoice.invoice_type?.toLowerCase() === "final"
  );

  const bookingPayments = payments.filter(
    (payment) =>
      payment.booking_id === booking?.booking_id &&
      payment.payment_status === "Completed"
  );

  const totalPaid = bookingPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const nights = Number(booking?.total_nights || 0);
  const accommodationAmount = Number(
    booking?.total_booking_amount || 0
  );

  const extraTotal = extraItems.reduce(
    (sum, item) =>
      sum +
      Math.max(
        0,
        Number(item.quantity || 0) * Number(item.unit_price || 0) -
        Number(item.discount_amount || 0)
      ),
    0
  );

  const estimatedSubtotal = accommodationAmount + extraTotal;

  const addExtraItem = () => {
    setExtraItems((prev) => [
      ...prev,
      {
        description: "",
        quantity: 1,
        unit_price: "",
        tax_rate: "0",
        discount_amount: "0",
        sac_code: ""
      }
    ]);
  };

  const updateExtraItem = (index, field, value) => {
    setExtraItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeExtraItem = (index) => {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  };

  const createInvoice = async () => {
    if (!booking) {
      alert("Please select a booking.");
      return;
    }

    if (booking.booking_status?.toLowerCase() === "cancelled") {
      alert("Cannot generate an invoice for a cancelled booking.");
      return;
    }

    if (invoiceType === "Final" && existingFinalInvoice) {
      alert("A final invoice already exists for this booking.");
      return;
    }

    if (!customer) {
      alert("Customer details could not be found.");
      return;
    }

    if (accommodationAmount <= 0) {
      alert("The booking has no valid accommodation amount.");
      return;
    }

    for (const item of extraItems) {
      if (!item.description.trim()) {
        alert("Enter a description for every additional charge.");
        return;
      }

      if (
        Number(item.quantity) <= 0 ||
        Number(item.unit_price) < 0 ||
        Number(item.tax_rate) < 0 ||
        Number(item.discount_amount) < 0
      ) {
        alert("Check the quantity, price, tax and discount values.");
        return;
      }

      const lineTotal =
        Number(item.quantity) * Number(item.unit_price);

      if (Number(item.discount_amount) > lineTotal) {
        alert("An item discount cannot exceed its line total.");
        return;
      }
    }

    const items = [
      {
        description: "Accommodation charges",
        quantity: 1,
        unit_price: accommodationAmount,
        tax_rate: 0,
        discount_amount: 0
      },
      ...extraItems.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_rate: Number(item.tax_rate || 0),
        discount_amount: Number(item.discount_amount || 0),
        sac_code: item.sac_code.trim() || null
      }))
    ];

    const subtotal = items.reduce(
      (sum, item) =>
        sum + item.quantity * item.unit_price,
      0
    );

    const discountTotal = items.reduce(
      (sum, item) => sum + item.discount_amount,
      0
    );

    const taxableEstimate = subtotal - discountTotal;

    const taxEstimate = items.reduce(
      (sum, item) => {
        const lineAmount =
          item.quantity * item.unit_price - item.discount_amount;

        return sum + lineAmount * item.tax_rate / 100;
      },
      0
    );

    const payload = {
      booking_id: booking.booking_id,
      invoice_number: `MER-${Date.now()}`,
      invoice_type: invoiceType,
      subtotal: Number(subtotal.toFixed(2)),
      taxable_amount: Number(taxableEstimate.toFixed(2)),
      tax_amount: Number(taxEstimate.toFixed(2)),
      total_amount: Number((taxableEstimate + taxEstimate).toFixed(2)),
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      discount_amount: Number(discountTotal.toFixed(2)),
      rounding_adjustment: 0,
      items
    };

    try {
      setSaving(true);

      const response = await fetch(`${API}/invoices/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Unable to create invoice."
        );
      }

      const savedInvoice = await response.json();

      setInvoices((prev) => [savedInvoice, ...prev]);
      setExtraItems([]);

      alert(
        `${invoiceType} invoice ${savedInvoice.invoice_number} created successfully!`
      );

      await fetchBillingData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePayment = async () => {
    if (!booking) {
      alert("Please select a booking.");
      return;
    }

    if (booking.booking_status?.toLowerCase() === "cancelled") {
      alert("Cannot record a payment for a cancelled booking.");
      return;
    }

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    try {
      const response = await fetch(`${API}/payments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          invoice_id: null,
          amount,
          payment_method: paymentMethod,
          payment_status: "Completed",
          payment_notes: paymentNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Unable to save payment."
        );
      }

      const savedPayment = await response.json();

      setPayments((prev) => [savedPayment, ...prev]);
      setPaymentAmount("");
      setPaymentNotes("");

      alert("Payment saved successfully!");
    } catch (err) {
      alert(err.message);
    }
  };
const downloadInvoicePdf = async (invoiceId, invoiceNumber) => {
  try {
    const response = await fetch(
      `${API}/invoices/${invoiceId}/pdf`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Unable to download invoice PDF."
      );
    }

    const blob = await response.blob();
    const fileUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${invoiceNumber}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(fileUrl);
  } catch (err) {
    alert(err.message);
  }
};

const printInvoice = async (invoiceId) => {
  try {
    const response = await fetch(
      `${API}/invoices/${invoiceId}/pdf`
    );

    if (!response.ok) {
      throw new Error("Unable to prepare invoice for printing.");
    }

    const blob = await response.blob();
    const fileUrl = window.URL.createObjectURL(blob);

    const printWindow = window.open(fileUrl, "_blank");

    if (!printWindow) {
      window.URL.revokeObjectURL(fileUrl);
      alert("Please allow pop-ups for this website to print invoices.");
      return;
    }

    // The PDF opens in a new tab. Use Ctrl + P or
    // the PDF viewer's printer icon to open the print dialog.
    printWindow.focus();

    // Keep the object URL available while the PDF is open.
    // The browser releases it when the page is closed.
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FINANCIAL MANAGEMENT</p>
          <h1>Billing & Invoices</h1>
          <p className="page-subtitle">
            Manage accommodation charges, additional services,
            advance payments and final invoices.
          </p>
        </div>
      </div>

      <div className="room-summary-grid">
        <div className="room-summary-card">
          <span>Total bookings</span>
          <strong>{bookings.length}</strong>
        </div>

        <div className="room-summary-card">
          <span>Total invoices</span>
          <strong>{invoices.length}</strong>
        </div>

        <div className="room-summary-card">
          <span>Selected invoice type</span>
          <strong>{invoiceType}</strong>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Create invoice</h3>
            <p>Select a booking to prepare its invoice.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading billing data...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <div className="form-grid">
            <label>
              Select booking
              <select
                value={selectedBooking}
                onChange={(e) => {
                  setSelectedBooking(e.target.value);
                  setExtraItems([]);
                }}
              >
                <option value="">Choose booking</option>

                {bookings.map((b) => (
                  <option
                    key={b.booking_id}
                    value={b.booking_id}
                  >
                    BK-{String(b.booking_id).padStart(4, "0")}
                    {" — "}
                    {b.booking_type === "entire_resort"
                      ? "Entire Resort"
                      : `Room ${b.room_id}`}
                    {" — "}
                    {b.booking_status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Invoice type
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
              >
                <option value="Booking">Booking / Advance Invoice</option>
                <option value="Final">Final Invoice</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {booking && (
        <>
          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3>Booking details</h3>
                <p>Review the selected guest reservation.</p>
              </div>
            </div>

            <div className="room-summary-grid">
              <div className="room-summary-card">
                <span>Customer</span>
                <strong>{customer?.full_name || "Not found"}</strong>
              </div>

              <div className="room-summary-card">
                <span>Mobile</span>
                <strong>{customer?.phone || "—"}</strong>
              </div>

              <div className="room-summary-card">
                <span>Total guests</span>
                <strong>{booking.guests}</strong>
              </div>

              <div className="room-summary-card">
                <span>Total nights</span>
                <strong>{nights}</strong>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Check-in
                <input
                  value={`${booking.check_in} ${booking.check_in_time || ""}`}
                  readOnly
                />
              </label>

              <label>
                Check-out
                <input
                  value={`${booking.check_out} ${booking.check_out_time || ""}`}
                  readOnly
                />
              </label>

              <label>
                Price per night
                <input
                  value={formatCurrency(booking.price_per_night)}
                  readOnly
                />
              </label>

              <label>
                Accommodation amount
                <input
                  value={formatCurrency(accommodationAmount)}
                  readOnly
                />
              </label>
            </div>

            <div className="room-summary-grid">
              <div className="room-summary-card">
                <span>Accommodation amount</span>
                <strong>{formatCurrency(accommodationAmount)}</strong>
              </div>

              <div className="room-summary-card">
                <span>Completed payments received</span>
                <strong>{formatCurrency(totalPaid)}</strong>
              </div>

              <div className="room-summary-card">
                <span>Additional charges</span>
                <strong>{formatCurrency(extraTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3>Additional charges</h3>
                <p>
                  Add services, extra beds, food, damages,
                  photography or other charges.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={addExtraItem}
              >
                + Add charge
              </button>
            </div>

            {extraItems.length === 0 ? (
              <p className="empty-state">
                No additional charges added.
              </p>
            ) : (
              extraItems.map((item, index) => (
                <div
                  key={index}
                  className="form-grid"
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid #e5e7eb"
                  }}
                >
                  <label>
                    Description
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Campfire"
                    />
                  </label>

                  <label>
                    Quantity
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Unit price (₹)
                    <input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "unit_price",
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    Discount (₹)
                    <input
                      type="number"
                      min="0"
                      value={item.discount_amount}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "discount_amount",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Tax rate (%)
                    <input
                      type="number"
                      min="0"
                      value={item.tax_rate}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "tax_rate",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    SAC code (optional)
                    <input
                      value={item.sac_code}
                      onChange={(e) =>
                        updateExtraItem(
                          index,
                          "sac_code",
                          e.target.value
                        )
                      }
                      placeholder="Enter confirmed SAC code"
                    />
                  </label>

                  <div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => removeExtraItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="room-summary-grid">
              <div className="room-summary-card">
                <span>Estimated subtotal before discounts</span>
                <strong>
                  {formatCurrency(
                    accommodationAmount +
                    extraItems.reduce(
                      (sum, item) =>
                        sum +
                        Number(item.quantity || 0) *
                        Number(item.unit_price || 0),
                      0
                    )
                  )}
                </strong>
              </div>

              <div className="room-summary-card">
                <span>Estimated amount after discounts</span>
                <strong>{formatCurrency(estimatedSubtotal)}</strong>
              </div>
            </div>

            <p className="page-subtitle">
              Tax rates and SAC codes must be confirmed by the
              resort's accountant before issuing a genuine tax invoice.
            </p>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3>Record a payment</h3>
                <p>
                  Record advance or additional payments received
                  from this guest.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Payment amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </label>

              <label>
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </label>

              <label>
                Payment notes
                <input
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Transaction reference or notes"
                />
              </label>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={savePayment}
            >
              Save Payment
            </button>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3>Payment history</h3>
                <p>Completed payments received for this booking.</p>
              </div>
            </div>

            {bookingPayments.length === 0 ? (
              <p className="empty-state">
                No completed payments recorded yet.
              </p>
            ) : (
              bookingPayments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="transaction-row"
                >
                  <div className="transaction-copy">
                    <strong>{formatCurrency(payment.amount)}</strong>
                    <span>
                      {payment.payment_method} · {payment.payment_status}
                    </span>
                  </div>

                  <span>
                    {payment.payment_date
                      ? new Date(payment.payment_date).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
              ))
            )}
          </div>

                    <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3>Invoices for this booking</h3>
                <p>Previously generated invoices.</p>
              </div>
            </div>

            {bookingInvoices.length === 0 ? (
              <p className="empty-state">
                No invoices created for this booking.
              </p>
            ) : (
              bookingInvoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="transaction-row"
                >
                  <div className="transaction-copy">
                    <strong>{invoice.invoice_number}</strong>
                    <span>
                      {invoice.invoice_type} · {invoice.invoice_status || "Generated"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}
                  >
                    <strong>{formatCurrency(invoice.total_amount)}</strong>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        downloadInvoicePdf(invoice.invoice_id, invoice.invoice_number)
                      }
                    >
                      Download PDF
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => printInvoice(invoice.invoice_id)}
                    >
                      Print Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="table-card">
            <div className="room-modal-actions">
              <span>
                {invoiceType === "Final"
                  ? existingFinalInvoice
                    ? "A final invoice already exists."
                    : "Ready to generate final invoice."
                  : "Ready to generate booking invoice."}
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={createInvoice}
                disabled={
                  saving ||
                  loading ||
                  booking.booking_status?.toLowerCase() === "cancelled" ||
                  (invoiceType === "Final" && existingFinalInvoice)
                }
              >
                {saving
                  ? "Generating..."
                  : `Generate ${invoiceType} Invoice`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
//payment page
function PaymentsPage() {
  const API = "http://127.0.0.1:8000";

  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentRes, bookingRes, customerRes] = await Promise.all([
          fetch(`${API}/payments/`),
          fetch(`${API}/bookings/`),
          fetch(`${API}/customers/`)
        ]);

        if (!paymentRes.ok || !bookingRes.ok || !customerRes.ok) {
          throw new Error("Unable to load payment records.");
        }

        const paymentData = await paymentRes.json();
        const bookingData = await bookingRes.json();
        const customerData = await customerRes.json();

        setPayments(paymentData);
        setBookings(bookingData);
        setCustomers(customerData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedPayments = payments.filter(
    payment => payment.payment_status === "Completed"
  );

  const totalCollected = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const pendingPayments = payments
    .filter(payment => payment.payment_status === "Pending")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const filteredPayments = payments.filter(payment => {
  const booking = bookings.find(
    b => b.booking_id === payment.booking_id
  );

  const customer = customers.find(
    c => c.customer_id === booking?.customer_id
  );

  const searchText =
    `${customer?.full_name || ""} ${payment.booking_id}`.toLowerCase();

  const matchesSearch = searchText.includes(search.toLowerCase());

  const matchesMethod =
    methodFilter === "All" || payment.payment_method === methodFilter;

  const matchesStatus =
    statusFilter === "All" || payment.payment_status === statusFilter;

  return matchesSearch && matchesMethod && matchesStatus;
});

  const formatCurrency = amount =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FINANCIAL MANAGEMENT</p>
          <h1>Payments</h1>
          <p className="page-subtitle">
            Track all guest payments and transactions.
          </p>
        </div>
      </div>

      <div className="room-summary-grid">
        <div className="room-summary-card">
          <span>Total collected</span>
          <strong>{formatCurrency(totalCollected)}</strong>
        </div>

        <div className="room-summary-card">
          <span>Pending payments</span>
          <strong>{formatCurrency(pendingPayments)}</strong>
        </div>

        <div className="room-summary-card">
          <span>Total transactions</span>
          <strong>{payments.length}</strong>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>All transactions</h3>
            <p>Payment records across all bookings.</p>
          </div>
        </div>
        <div className="form-grid">
  <label>
    Search guest or booking ID
    <input
      type="text"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search..."
    />
  </label>

  <label>
    Payment method
    <select
      value={methodFilter}
      onChange={e => setMethodFilter(e.target.value)}
    >
      <option value="All">All methods</option>
      <option value="Cash">Cash</option>
      <option value="UPI">UPI</option>
      <option value="Card">Card</option>
      <option value="Bank Transfer">Bank Transfer</option>
    </select>
  </label>

  <label>
    Payment status
    <select
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value)}
    >
      <option value="All">All statuses</option>
      <option value="Completed">Completed</option>
      <option value="Pending">Pending</option>
      <option value="Failed">Failed</option>
    </select>
  </label>
</div>

        {loading ? (
          <p className="empty-state">Loading payments...</p>
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : filteredPayments.length === 0 ? (
        <p className="empty-state">No matching payments found.</p>
      ) : (
          filteredPayments.map(payment => {
            const booking = bookings.find(
              b => b.booking_id === payment.booking_id
            );

            const customer = customers.find(
              c => c.customer_id === booking?.customer_id
            );

            return (
              <div
                key={payment.payment_id}
                className="transaction-row"
              >
                <div className="transaction-copy">
                  <strong>{customer?.full_name || "Unknown guest"}</strong>
                  <span>
                    BK-{String(payment.booking_id).padStart(4, "0")}
                    {" · "}
                    {payment.payment_method}
                  </span>
                </div>

                <span>
                  {payment.payment_date
                    ? new Date(payment.payment_date).toLocaleDateString("en-IN")
                    : "—"}
                </span>

                <strong>{formatCurrency(payment.amount)}</strong>

                <span>{payment.payment_status || "Unknown"}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
/* =========================================
   MAIN APPLICATION
========================================= */

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/summary"
      );

      if (!response.ok) {
        throw new Error("Unable to load dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
      setDashboardError("");
    } catch (error) {
      console.error("Dashboard error:", error);
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  fetchDashboard();
}, []);

  
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));

const dashboardStats = [
  {
    label: "Revenue this month",
    value: formatCurrency(dashboardData?.statistics?.revenue_this_month),
    change: "Completed payments",
    note: "Received this month",
    icon: Wallet,
    tone: "gold"
  },
  {
    label: "Total bookings",
    value: dashboardData?.statistics?.total_bookings ?? "—",
    change: "Active reservations",
    note: "Excludes cancelled bookings",
    icon: CalendarDays,
    tone: "sage"
  },
  {
    label: "Available rooms",
    value: dashboardData
      ? `${dashboardData.occupancy.available} / ${dashboardData.occupancy.total}`
      : "—",
    change: dashboardData
      ? `${dashboardData.occupancy.percentage}% occupied`
      : "Loading",
    note: "Today's room availability",
    icon: BedDouble,
    tone: "blue"
  },
  {
    label: "Pending payments",
    value: formatCurrency(dashboardData?.statistics?.pending_payments),
    change: "Outstanding balance",
    note: "Estimated from booking amounts",
    icon: Clock,
    tone: "clay"
  }
];

const dashboardTransactions =
  dashboardData?.recent_transactions || [];

const occupancy = dashboardData?.occupancy || {
  occupied: 0,
  available: 0,
  maintenance: 0,
  total: 0,
  percentage: 0
};

const activity = dashboardData?.activity || {
  check_ins: 0,
  check_outs: 0,
  guests_staying: 0
};

const dashboardDate = dashboardData?.date
  ? new Date(`${dashboardData.date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    )
  : "Loading date";

const filteredBookings = useMemo(() => {
  const recentBookings = dashboardData?.recent_bookings || [];

  return recentBookings.filter((booking) =>
    `${booking.name} ${booking.id} ${booking.room}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
}, [dashboardData, search]);


  const navigate = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>

        <div className="brand-row">

          <div className="brand-mark">
            <Waves size={25} />
          </div>

          <div className="brand-copy">
            <div className="brand-name">
              Mango <span>Estate</span>
            </div>

            <div className="brand-caption">
              RESORTS & RETREATS
            </div>
          </div>

          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>

        </div>

        <div className="nav-section-label">
          WORKSPACE
        </div>

        <nav className="navigation">

          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${
                activePage === name ? "active" : ""
              }`}
              onClick={() => navigate(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}

        </nav>

        <div className="nav-section-label preferences-label">
          PREFERENCES
        </div>


        <div className="sidebar-spacer"></div>

        <div className="sidebar-support">

          <div className="support-symbol">
            <Sparkles size={17} />
          </div>

          <div className="support-title">
            Need a hand?
          </div>

          <p>
            Our support team is here to help you.
          </p>

          <button
            onClick={() =>
              window.alert("Please contact your resort administrator.")
            }
          >
            Contact support <ArrowRight size={14} />
          </button>

        </div>

        <div className="sidebar-profile">

          <div className="profile-avatar">AD</div>

          <div className="profile-copy">
            <strong>Admin User</strong>
            <span>Administrator</span>
          </div>

          <button
            className="icon-button logout-button"
            aria-label="Log out"
          >
            <LogOut size={17} />
          </button>

        </div>

      </aside>

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOP HEADER */}

        <header className="topbar">

          <div className="topbar-heading">

            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace <span>/</span> {activePage}
              </div>

              <h1>{activePage}</h1>
            </div>

          </div>

          <div className="topbar-right">

            <div className="date-display">
              <CalendarDays size={16} />
              <span>{dashboardDate}</span>
            </div>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>

            <button className="top-avatar">
              AD
            </button>

          </div>

        </header>

        {/* DASHBOARD OR ROOMS PAGE */}

        {activePage === "Dashboard" ? (

          <div className="dashboard-content">

            {/* WELCOME */}

            <section className="welcome-section">
              {dashboardLoading && (
                <p className="empty-state">Loading dashboard data...</p>
                )}
                {dashboardError && (
                  <p className="empty-state">{dashboardError}</p>
                  )}

              <div>
                <div className="eyebrow">
                  {dashboardDate.toUpperCase()}
                </div>

                <h2>
                  Welcome! Admin <span>✦</span>
                </h2>

                <p>
                  Here’s your resort at a glance. Have a productive day.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => navigate("Bookings")}
              >
                <Plus size={17} />
                Create booking
              </button>

            </section>

            {/* STATISTICS */}

            <section className="stats-grid">

              {dashboardStats.map(
                ({ label, value, change, note, icon: Icon, tone }) => (
                  <article className="stat-card" key={label}>

                    <div className="stat-card-top">

                      <div className={`stat-icon ${tone}`}>
                        <Icon size={19} />
                      </div>

                      <button className="icon-button more-button">
                        <MoreHorizontal size={19} />
                      </button>

                    </div>

                    <div className="stat-label">
                      {label}
                    </div>

                    <div className="stat-value">
                      {value}
                    </div>

                    <div className="stat-meta">

                      <span
                        className={`stat-change ${
                          tone === "clay" ? "attention" : ""
                        }`}
                      >
                        {tone !== "clay" && <ArrowUpRight size={13} />}
                        {change}
                      </span>

                      <span>{note}</span>

                    </div>

                  </article>
                )
              )}

            </section>

            {/* OCCUPANCY AND ACTIVITY */}

            <section className="overview-grid">

              <article className="surface-card occupancy-card">

                <div className="section-heading">

                  <div>
                    <div className="section-kicker">CAPACITY</div>
                    <h3>Room occupancy</h3>
                    <p>Live overview of your room inventory</p>
                  </div>

                  <button className="select-button">
                    Today <ChevronDown size={14} />
                  </button>

                </div>

                <div className="occupancy-body">

                  <div className="donut-chart">
                    <div className="donut-center">
                      <strong>{occupancy.percentage}<span>%</span></strong>
                      <small>Occupied</small>
                    </div>
                  </div>

                  <div className="occupancy-details">

                    <div className="legend-row">
                      <span className="legend-name">
                        <i className="legend-dot occupied-dot" />
                        Occupied
                      </span>
                      <strong>{occupancy.occupied}</strong>
                    </div>

                    <div className="legend-row">
                      <span className="legend-name">
                        <i className="legend-dot available-dot" />
                        Available
                      </span>
                      <strong>{occupancy.available}</strong>
                    </div>

                    <div className="legend-row">
                      <span className="legend-name">
                        <i className="legend-dot maintenance-dot" />
                        Maintenance
                      </span>
                      <strong>{occupancy.maintenance}</strong>
                    </div>

                    <div className="occupancy-footnote">
                      {occupancy.total} rooms in total
                    </div>

                  </div>

                </div>

              </article>

              <article className="surface-card activity-card">

                <div className="section-heading">

                  <div>
                    <div className="section-kicker">GUEST MOVEMENT</div>
                    <h3>Today’s activity</h3>
                    <p>Arrivals, departures and in-house guests</p>
                  </div>

                  <button className="icon-button calendar-icon">
                    <CalendarDays size={18} />
                  </button>

                </div>

                <div className="activity-list">

                  <div className="activity-row">

                    <div className="activity-symbol arrival">
                      <ArrowDownRight size={18} />
                    </div>

                    <div className="activity-copy">
                      <strong>Check-ins</strong>
                      <span>Expected guest arrivals</span>
                    </div>

                    <strong className="activity-value">
                      {activity.check_ins}
                      </strong>

                  </div>

                  <div className="activity-row">

                    <div className="activity-symbol departure">
                      <ArrowUpRight size={18} />
                    </div>

                    <div className="activity-copy">
                      <strong>Check-outs</strong>
                      <span>Expected guest departures</span>
                    </div>

                    <strong className="activity-value">
                      {activity.check_outs}
                    </strong>

                  </div>

                  <div className="activity-row">

                    <div className="activity-symbol staying">
                      <Users size={18} />
                    </div>

                    <div className="activity-copy">
                      <strong>Guests staying</strong>
                      <span>Currently at the resort</span>
                    </div>

                    <strong className="activity-value">
                      {activity.guests_staying}
                    </strong>

                  </div>

                </div>

              </article>

            </section>

            {/* RECENT BOOKINGS */}

            <section className="surface-card bookings-card">

              <div className="section-heading bookings-heading">

                <div>
                  <div className="section-kicker">RESERVATIONS</div>
                  <h3>Recent bookings</h3>
                  <p>A quick look at your latest guest reservations</p>
                </div>

                <div className="table-tools">

                  <label className="search-field">
                    <Search size={16} />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search guests or bookings"
                    />
                  </label>

                  <button className="filter-button">
                    <SlidersHorizontal size={17} />
                  </button>

                  <button
                    className="text-button"
                    onClick={() => navigate("Bookings")}
                  >
                    View all <ArrowRight size={14} />
                  </button>

                </div>

              </div>

              <div className="table-wrap">

                <table className="booking-table">

                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>GUEST</th>
                      <th>ROOM TYPE</th>
                      <th>CHECK-IN</th>
                      <th>CHECK-OUT</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>

                        <td className="booking-code">
                          {booking.id}
                        </td>

                        <td>
                          <div className="guest-cell">
                            <span className="guest-avatar">
                              {booking.initials}
                            </span>
                            <strong>{booking.name}</strong>
                          </div>
                        </td>

                        <td>{booking.room}</td>
                        <td>{booking.checkin}</td>
                        <td>{booking.checkout}</td>

                        <td className="amount-cell">
                          {booking.amount}
                        </td>

                        <td>
                          <span
                            className={`status-pill ${
                              booking.status.toLowerCase().replace(" ", "-")
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>

                      </tr>
                    ))}

                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          No matching bookings found.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* RECENT TRANSACTIONS */}

            <section className="surface-card transactions-card">

              <div className="section-heading">

                <div>
                  <div className="section-kicker">CASH FLOW</div>
                  <h3>Recent transactions</h3>
                  <p>Latest payments recorded by your team</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => navigate("Payments")}
                >
                  All transactions <ArrowRight size={14} />
                </button>

              </div>

              <div className="transaction-list">

                {dashboardTransactions.map((transaction, index) => (
  <div
    className="transaction-row"
    key={`${transaction.name}-${transaction.time}-${index}`}
  >
    <div className="transaction-avatar">
      {transaction.initials}
    </div>

    <div className="transaction-copy">
      <strong>{transaction.name}</strong>
      <span>
        {transaction.type} · {transaction.method}
      </span>
    </div>

    <span className="transaction-time">
      {transaction.time}
    </span>

    <strong className="transaction-amount">
      {transaction.amount}
    </strong>

    <CheckCircle2 size={17} className="paid-check" />
  </div>
))}

{dashboardTransactions.length === 0 && (
  <p className="empty-state">No completed transactions yet.</p>
)}

              </div>

            </section>

            <footer className="dashboard-footer">
              <span>© 2026 Mango Estate & Resorts</span>
              <span>Thoughtfully designed for hospitality operations.</span>
            </footer>

          </div>

        ) : activePage === "Rooms" ? (

              <RoomsPage />

        ) : activePage === "Bookings" ? (

            <BookingsPage />
        ): activePage === "Customers" ? (

          <CustomersPage/>
        ) : activePage === "Billing & Invoices" ? (
          <BillingPage />
        ) : activePage === "Payments" ? (
          <PaymentsPage />
        ) : activePage === "Services" ? (
        <ServicesPage />
        ): (
          <div className="module-placeholder">

            <div className="placeholder-icon">
              <Hotel size={27} />
            </div>

            <div className="section-kicker">
              MANGO ESTATE MANAGEMENT
            </div>

            <h2>{activePage}</h2>

            <p>
              This section is ready for the next development phase.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("Dashboard")}
            >
              Return to dashboard <ArrowRight size={15} />
            </button>

          </div>

        )}

      </main>
    </div>
  );
}

export default App;
