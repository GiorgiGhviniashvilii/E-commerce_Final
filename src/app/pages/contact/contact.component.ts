import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="contact-hero">
      <div class="container">
        <span class="badge">Contact</span>
        <h1>We are here to help</h1>
        <p>Reach out for partnerships, support, or a custom order inquiry.</p>
      </div>
    </section>

    <section class="section">
      <div class="container contact-grid">
        <div class="contact-info">
          <h2>Visit our studio</h2>
          <p>112 W. Harbor Ave, San Francisco, CA</p>
          <div class="info-card">
            <h4>Support</h4>
            <p>support@ecomhub.com</p>
            <p>+1 (415) 555-0199</p>
          </div>
          <div class="info-card">
            <h4>Business hours</h4>
            <p>Mon - Fri: 9:00 - 18:00</p>
            <p>Sat: 10:00 - 16:00</p>
          </div>
        </div>
        <div class="contact-form card">
          <h3>Send a message</h3>
          <form>
            <label>
              Full name
              <input type="text" placeholder="Jane Doe" />
            </label>
            <label>
              Email address
              <input type="email" placeholder="you@email.com" />
            </label>
            <label>
              Subject
              <input type="text" placeholder="Order support" />
            </label>
            <label>
              Message
              <textarea rows="5" placeholder="Tell us how we can help"></textarea>
            </label>
            <button class="btn primary" type="button">Send message</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .contact-hero {
        background: #ffffff;
        padding: 60px 0;
        border-bottom: 1px solid #ececec;
      }

      .contact-hero h1 {
        margin: 12px 0;
        font-size: 38px;
      }

      .contact-hero p {
        color: #6d6d6d;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1.1fr;
        gap: 32px;
      }

      .contact-info {
        display: grid;
        gap: 20px;
      }

      .info-card {
        background: #ffffff;
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
      }

      .contact-form h3 {
        margin-top: 0;
      }

      form {
        display: grid;
        gap: 14px;
      }

      label {
        display: grid;
        gap: 6px;
        font-weight: 500;
      }

      input,
      textarea {
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 10px 12px;
        font-family: inherit;
      }
    `,
  ],
})
export class ContactComponent {}
