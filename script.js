// CUBO Reformas - lógica de la web
// Los datos que puedes cambiar fácilmente están en config.js.
const CONFIG = window.CUBO_CONFIG || {};
const WHATSAPP_NUMBER = CONFIG.whatsapp || "34664799889";
const INSTAGRAM_URL = CONFIG.instagram || "https://www.instagram.com/cuboreformas/";
const CONTACT_EMAIL = CONFIG.email || "info.cuboreformas@gmail.com";
const whatsappMessage = encodeURIComponent(
  CONFIG.mensajeWhatsApp || "Hola, quiero solicitar información sobre una reforma."
);

function setupExternalLinks() {
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = WHATSAPP_NUMBER !== "TU_NUMERO_DE_WHATSAPP"
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`
      : "#";

    link.addEventListener("click", (event) => {
      if (WHATSAPP_NUMBER === "TU_NUMERO_DE_WHATSAPP") {
        event.preventDefault();
        alert("Añade tu número de WhatsApp en config.js antes de publicar la web.");
      }
    });
  });

  ["instagram-link", "instagram-footer"].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;

    link.href = INSTAGRAM_URL !== "TU_URL_DE_INSTAGRAM" ? INSTAGRAM_URL : "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.addEventListener("click", (event) => {
      if (INSTAGRAM_URL === "TU_URL_DE_INSTAGRAM") {
        event.preventDefault();
        alert("Añade la URL de Instagram en config.js antes de publicar la web.");
      }
    });
  });
}

function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function setupServiceSelection() {
  const gallerySection = document.getElementById("galeria-servicios");
  const galleryGrid = document.getElementById("service-gallery-grid");
  const galleryTitle = document.getElementById("galeria-titulo");
  const galleryDescription = document.getElementById("galeria-descripcion");
  const galleryClose = document.querySelector(".gallery-close");
  const galleryQuoteButton = document.querySelector(".gallery-quote-btn");
  const galleryInstagram = document.getElementById("gallery-instagram-link");
  const serviceSelect = document.getElementById("servicio");

  if (!gallerySection || !galleryGrid) return;



  const galleries = {
    "Reforma integral": {
      title: "Reformas integrales de apartamentos",
      description: "Ideas y acabados para transformar por completo tu vivienda.",
      folder: "integral"
    },
    "Reforma parcial": {
      title: "Reformas parciales",
      description: "Intervenciones concretas para renovar una o varias zonas del apartamento.",
      folder: "parcial"
    },
    "Cocina": {
      title: "Reformas de cocina",
      description: "Cocinas funcionales, abiertas y adaptadas al estilo de cada vivienda.",
      folder: "cocina"
    },
    "Baño": {
      title: "Reformas de baño",
      description: "Baños renovados con soluciones prácticas y acabados cuidados.",
      folder: "bano"
    },
    "Otro": {
      title: "Otros espacios",
      description: "Cuéntanos qué zona quieres transformar y estudiaremos la mejor solución.",
      folder: "otro"
    }
  };

  function openGallery(service) {
    const data = galleries[service];
    if (!data) return;

    galleryTitle.textContent = data.title;
    galleryDescription.textContent = data.description;
    galleryGrid.innerHTML = Array.from({ length: 10 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      const src = `images/galerias/${data.folder}/${number}.jpg`;
      const alt = `${data.title} - imagen ${index + 1}`;
      return `
        <figure class="service-gallery-item">
          <img src="${src}" alt="${alt}" loading="lazy">
        </figure>
      `;
    }).join("");

    gallerySection.hidden = false;

    if (serviceSelect) {
      serviceSelect.value = service;
    }

    gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => openGallery(card.dataset.service));
  });

  document.querySelectorAll(".footer-service-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openGallery(link.dataset.service);
    });
  });

  if (galleryClose) {
    galleryClose.addEventListener("click", () => {
      gallerySection.hidden = true;
      document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (galleryQuoteButton) {
    galleryQuoteButton.addEventListener("click", () => {
      // El servicio ya queda preseleccionado en el formulario.
    });
  }

  if (galleryInstagram) {
    galleryInstagram.href = INSTAGRAM_URL;
    galleryInstagram.target = "_blank";
    galleryInstagram.rel = "noopener noreferrer";
  }
}



function setupForm() {
  const form = document.getElementById("quote-form");
  const status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    if (status) {
      status.className = "form-status";
      status.textContent = "";
    }

    const formData = new FormData(form);

    if (formData.get("_honey")) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
      return;
    }

    const payload = {};
    formData.forEach((value, key) => {
      if (!key.startsWith("_")) payload[key] = value;
    });

    payload._subject = CONFIG.asuntoFormulario || "Solicitud de presupuesto - CUBO Reformas";
    payload._template = "table";
    payload._captcha = "false";

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudo enviar el formulario.");
      }

      form.reset();

      if (status) {
        status.className = "form-status success";
        status.textContent = "Solicitud enviada correctamente. Gracias, nos pondremos en contacto contigo.";
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      if (status) {
        status.className = "form-status error";
        status.innerHTML = 'No se pudo enviar la solicitud. Puedes escribirnos por <a class="js-whatsapp-error" href="#">WhatsApp</a>.';
        const wa = status.querySelector(".js-whatsapp-error");
        if (wa) {
          wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
          wa.target = "_blank";
          wa.rel = "noopener noreferrer";
        }
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}


document.getElementById("year").textContent = new Date().getFullYear();

setupExternalLinks();
setupMobileMenu();
setupServiceSelection();
setupForm();
