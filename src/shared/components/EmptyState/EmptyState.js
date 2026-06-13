import './EmptyState.css';

/**
 * EmptyState — Web Component for empty/placeholder states.
 *
 * Usage:
 *   <empty-state icon="cloud_upload" title="Upload" description="Drop here">
 *     <button>Browse</button>
 *   </empty-state>
 *
 * Children are preserved and rendered after the description.
 */
export class EmptyState extends HTMLElement {
  connectedCallback() {
    // Save slotted children BEFORE setting innerHTML (innerHTML destroys them)
    const slottedChildren = [...this.childNodes];

    this.classList.add('empty-state-root');

    // Build template manually (no innerHTML — preserves children)
    this.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center justify-center gap-sm py-lg text-center';

    // Icon
    const iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-outlined text-[40px] text-secondary empty-icon';
    iconEl.style.fontVariationSettings = "'FILL' 0";
    const icon = this.getAttribute('icon');
    if (icon) {
      iconEl.textContent = icon;
    } else {
      iconEl.style.display = 'none';
    }
    wrapper.appendChild(iconEl);

    // Title
    const titleEl = document.createElement('h3');
    titleEl.className = 'font-headline-md text-base text-on-surface empty-title';
    titleEl.textContent = this.getAttribute('title') || '';
    wrapper.appendChild(titleEl);

    // Description
    const descEl = document.createElement('p');
    descEl.className = 'font-body-sm text-on-surface-variant max-w-[260px] empty-desc';
    descEl.textContent = this.getAttribute('description') || '';
    wrapper.appendChild(descEl);

    // Re-insert slotted children (buttons, links, etc.)
    slottedChildren.forEach(child => wrapper.appendChild(child));

    this.appendChild(wrapper);
  }

  static get observedAttributes() {
    return ['icon', 'title', 'description'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'icon') {
      const iconEl = this.querySelector('.empty-icon');
      if (iconEl) {
        if (newValue) {
          iconEl.textContent = newValue;
          iconEl.style.display = '';
        } else {
          iconEl.style.display = 'none';
        }
      }
    } else if (name === 'title') {
      const titleEl = this.querySelector('.empty-title');
      if (titleEl) titleEl.textContent = newValue || '';
    } else if (name === 'description') {
      const descEl = this.querySelector('.empty-desc');
      if (descEl) descEl.textContent = newValue || '';
    }
  }
}

customElements.define('empty-state', EmptyState);
