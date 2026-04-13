const renderCards = (rootId, items, template) => {
  const root = document.getElementById(rootId)
  if (!root) return
  root.innerHTML = items.map(template).join("")
}

const bindBookingLinks = () => {
  const url = siteContent.bookingUrl && siteContent.bookingUrl.trim() ? siteContent.bookingUrl : "#"

  document.querySelectorAll("[data-booking-link]").forEach((link) => {
    link.setAttribute("href", url)

    if (url === "#") {
      link.setAttribute("aria-disabled", "true")
      link.title = "Ссылка записи будет добавлена позже"
    } else {
      link.removeAttribute("aria-disabled")
      link.removeAttribute("title")
      link.setAttribute("target", "_blank")
      link.setAttribute("rel", "noreferrer")
    }
  })
}

const bindHeroLead = () => {
  const lead = document.querySelector("[data-hero-lead]")
  if (!lead || !siteContent.heroLead || !siteContent.heroLead.trim()) return
  lead.textContent = siteContent.heroLead.trim()
}

const bindNewsTicker = () => {
  const track = document.querySelector("[data-news-ticker-track]")
  if (!track) return

  const source = Array.isArray(siteContent.tickerNews) && siteContent.tickerNews.length > 0
    ? siteContent.tickerNews
    : (Array.isArray(siteContent.news) ? siteContent.news.map((item) => item.title) : [])

  const items = source
    .map((text) => (typeof text === "string" ? text.trim() : ""))
    .filter(Boolean)
    .map((text) => `<span class="news-ticker__item">${text}</span>`)

  if (items.length === 0) return

  const dot = '<span class="news-ticker__dot" aria-hidden="true">●</span>'
  const base = items.join(dot)
  const repeated = Array.from({ length: 6 }, () => base).join(dot)
  track.innerHTML = `${repeated}${dot}${repeated}`
}

const getHeroPhotos = () => {
  if (Array.isArray(siteContent.heroPhotos) && siteContent.heroPhotos.length > 0) {
    return siteContent.heroPhotos
      .map((p) => ({
        url: p.url && String(p.url).trim(),
        alt: (p.alt && String(p.alt).trim()) || ""
      }))
      .filter((p) => p.url)
  }
  if (siteContent.heroImageUrl && siteContent.heroImageUrl.trim()) {
    return [
      {
        url: siteContent.heroImageUrl.trim(),
        alt: (siteContent.heroImageAlt && siteContent.heroImageAlt.trim()) || ""
      }
    ]
  }
  return []
}

const bindHeroPhotos = () => {
  const wrap = document.querySelector("[data-hero-visual]")
  const img = document.querySelector("[data-hero-carousel-img]")
  const grid = document.querySelector(".hero-summary__grid")
  if (!wrap || !img) return

  const photos = getHeroPhotos()

  if (photos.length === 0) {
    wrap.hidden = true
    grid?.classList.add("hero-summary__grid--text-only")
    return
  }

  let index = 0
  const applySlide = (i) => {
    const p = photos[i]
    img.src = p.url
    img.alt = p.alt
  }

  applySlide(0)
  wrap.hidden = false
  grid?.classList.remove("hero-summary__grid--text-only")

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (photos.length < 2 || reduceMotion) {
    return
  }

  const intervalMs = 2000
  window.setInterval(() => {
    index = (index + 1) % photos.length
    applySlide(index)
  }, intervalMs)
}

const bindHeroVideo = () => {
  const video = document.querySelector("[data-hero-video]")
  const fallback = document.querySelector("[data-hero-fallback]")
  if (!video || !fallback) return

  const url = siteContent.heroVideoUrl && siteContent.heroVideoUrl.trim() ? siteContent.heroVideoUrl.trim() : ""

  if (!url) {
    fallback.style.display = "grid"
    video.style.display = "none"
    return
  }

  const source = document.createElement("source")
  source.src = url
  video.appendChild(source)

  fallback.style.display = "none"
  video.style.display = "block"
  video.load()
}

const bindMobileMenu = () => {
  const toggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector(".site-nav")
  if (!toggle || !nav) return

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open")
    toggle.setAttribute("aria-expanded", String(isOpen))
  })

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open")
      toggle.setAttribute("aria-expanded", "false")
    })
  })
}

const bindCenteredNavScroll = () => {
  const nav = document.querySelector(".site-nav")
  if (!nav) return

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href")
      if (!href || href === "#") return

      const target = document.querySelector(href)
      if (!target) return

      event.preventDefault()

      const targetRect = target.getBoundingClientRect()
      const targetTop = window.scrollY + targetRect.top
      const centeredTop = targetTop - (window.innerHeight - targetRect.height) / 2
      const nextTop = Math.max(0, centeredTop)

      window.scrollTo({
        top: nextTop,
        behavior: "smooth"
      })
    })
  })
}

const init = () => {
  renderCards(
    "services-grid",
    siteContent.services,
    (item) => `
      <article>
        <span>${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `
  )

  renderCards(
    "pricing-grid",
    siteContent.pricing || [],
    (item) => {
      const range = item.range && item.range.trim() ? `<p class="price-row__range">${item.range.trim()}</p>` : ""
      const note = item.note && item.note.trim() ? `<p class="price-row__note">${item.note.trim()}</p>` : ""
      return `
      <article class="price-row">
        <div class="price-row__head">
          <h3 class="price-row__title">${item.title}</h3>
          <span class="price-row__amount">${item.price}</span>
        </div>
        ${range}
        ${note}
      </article>
    `
    }
  )

  renderCards(
    "advantages-grid",
    siteContent.advantages,
    (item) => `
      <article>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `
  )

  renderCards(
    "works-grid",
    siteContent.works,
    (item) => {
      const hasPhoto = Boolean(item.image)
      const media = hasPhoto
        ? `<div class="work-card__media"><img src="${item.image}" alt="${item.alt || ""}" loading="lazy" width="720" height="960" decoding="async"></div>`
        : ""
      const body = `
        <span class="work-card__tag">${item.tag}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `
      const inner = hasPhoto ? `${media}<div class="work-card__body">${body}</div>` : body
      return `<article class="work-card work-card--${item.size}${hasPhoto ? " work-card--has-photo" : ""}">${inner}</article>`
    }
  )

  renderCards(
    "news-grid",
    siteContent.news,
    (item) => `
      <article class="news-card">
        <time>${item.date}</time>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </article>
    `
  )

  bindBookingLinks()
  bindNewsTicker()
  bindHeroLead()
  bindHeroPhotos()
  bindHeroVideo()
  bindMobileMenu()
  bindCenteredNavScroll()
}

document.addEventListener("DOMContentLoaded", init)
