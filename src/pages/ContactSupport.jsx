
import { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageCircle,
  CheckCircle2
} from "lucide-react";

function ContactSupport() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(form.subject);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href =
      `mailto:mangoestateresorts@gmail.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">HELP & SUPPORT</p>
          <h1>Contact Support</h1>
          <p className="page-subtitle">
            Have a question or need assistance? We're here to help.
          </p>
        </div>
      </div>

      <div className="support-grid">
        <div className="support-left">
          <div className="support-intro">
            <div className="support-icon">
              <MessageCircle size={26} />
            </div>
            <h2>How can we help you?</h2>
            <p>
              Get in touch with the Mango Estate & Resorts
              support team. We're happy to assist you.
            </p>
          </div>

          <div className="support-contact-card">
            <div className="support-contact-icon">
              <Mail size={20} />
            </div>
            <div>
              <span>Email us</span>
              <a href="mailto:mangoestateresorts@gmail.com">
                mangoestateresorts@gmail.com
              </a>
            </div>
          </div>

          <div className="support-contact-card">
            <div className="support-contact-icon">
              <Clock size={20} />
            </div>
            <div>
              <span>Support availability</span>
              <strong>Contact us by email</strong>
            </div>
          </div>
        </div>

        <div className="support-form-card">
          <h2>Send us a message</h2>
          <p>Fill in the details below and we'll be happy to help.</p>

          {submitted && (
            <div className="support-success">
              <CheckCircle2 size={19} />
              Your email application should open with your message.
              Please send it to complete your request.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="support-form-grid">
              <label>
                Full name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </label>
            </div>

            <label>
              Subject *
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What do you need help with?"
                required
              />
            </label>

            <label>
              Your message *
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your question or issue..."
                rows="5"
                required
              />
            </label>

            <button type="submit" className="primary-btn">
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;
