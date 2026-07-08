document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const skillCards = document.querySelectorAll('.skill-card');
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTag = document.getElementById('modalTag');
    const modalDetails = document.getElementById('modalDetails');
    const modalVideoContainer = document.getElementById('modalVideoContainer');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Keep track of the last focused element to restore it on modal close
    let lastFocusedElement = null;

    // Helper: extract tweet ID from full X/Twitter URL
    const parseTweetId = (url) => {
        if (url.includes('/status/')) {
            const after = url.split('/status/')[1];
            return after ? after.split('?')[0].split('/')[0] : url;
        }
        return url; // assume it's already a bare ID
    };

    const previewMedia = document.querySelectorAll('.card-preview-media');
    previewMedia.forEach((container) => {
        const previewUrl = container.getAttribute('data-preview-url');
        if (!previewUrl) return;

        container.innerHTML = `
            <div class="preview-placeholder">
                <span class="preview-badge">X Showcase</span>
                <span class="preview-text">Open in X</span>
            </div>
        `;

        container.addEventListener('click', (event) => {
            event.stopPropagation();
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // Open Modal Function
    const openModal = (card) => {
        lastFocusedElement = document.activeElement;

        const title     = card.querySelector('.card-title').textContent;
        const tag       = card.querySelector('.card-tag').textContent;
        const videoType = card.getAttribute('data-video-type');
        const videoId   = card.getAttribute('data-video-id');

        const detailsTemplate = card.querySelector('.card-details-template');
        const detailsHtml     = detailsTemplate ? detailsTemplate.innerHTML : '';

        // Inject text content
        modalTitle.textContent  = title;
        modalTag.textContent    = tag;
        modalDetails.innerHTML  = detailsHtml;

        // Build the player HTML depending on video source type
        if (videoType === 'youtube') {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                    title="${title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            `;

        } else if (videoType === 'custom-url') {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <video src="${videoId}" controls autoplay playsinline loop></video>
            `;

        } else if (videoType === 'x' || videoType === 'twitter') {
            const tweetUrl = videoId.startsWith('http') ? videoId : `https://x.com/i/status/${videoId}`;

            modalVideoContainer.classList.add('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <div class="tweet-fallback">
                    <p class="tweet-fallback-title">Showcase video</p>
                    <p class="tweet-fallback-copy">X embeds are blocked in this environment, so the showcase opens in a new tab.</p>
                    <a href="${tweetUrl}" target="_blank" rel="noopener">Open on X ↗</a>
                </div>
            `;

        } else {
            modalVideoContainer.classList.remove('video-container--tweet');
            modalVideoContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.95rem;">
                    No video configured yet.
                </div>
            `;
        }

        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modalCloseBtn.focus();
    };

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // Remove tweet class and clear content (stops any media instantly)
        modalVideoContainer.classList.remove('video-container--tweet');
        modalVideoContainer.innerHTML = '';

        if (lastFocusedElement) lastFocusedElement.focus();
    };

    // Attach click & keyboard listeners to all skill cards
    skillCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => openModal(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card);
            }
        });
    });

    // Close via button, backdrop click, or Escape key
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
});
