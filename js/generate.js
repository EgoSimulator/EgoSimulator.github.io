function formatEgoDexTitle(vidName) {
    const cleaned = vidName.replace(/(_\d+)+$/, '');
    const title = cleaned.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const tag = (typeof egodexTags !== 'undefined') && egodexTags[cleaned];
    return tag ? `${title} <span style="font-size:0.8em; font-weight:normal; color:var(--primary, #00f0ff);">(${tag})</span>` : title;
}

function generateSlides() {
    // 1. EgoDex
    const egodexWrapper = document.getElementById('egodex-wrapper');
    if (egodexWrapper && videoData.egodex) {
        const baselines = ["interdyn", "mask2iv", "coshand", "wan21inpaint"];
        const labels = {
            "interdyn": "InterDyn", 
            "mask2iv": "Mask2IV", 
            "coshand": "CosHand", 
            "wan21inpaint": "Wan2.1-Inpaint"
        };
        
        let html = '';
        videoData.egodex.forEach((vid, idx) => {
            const vidName = vid.replace(".mp4", "");
            const syncGroup = `egodex-${idx}`;
            
            let btnHtml = '';
            baselines.forEach(b => {
                const active = b === "interdyn" ? "active" : "";
                btnHtml += `<button class="method-btn-single ${active}" data-example="${syncGroup}" data-method="${b}" data-label="${labels[b]}">${labels[b]}</button>\n`;
            });
            
            const vidPaths = {};
            baselines.forEach(b => { vidPaths[b] = `videos/comparasion/egodex/${b}/${vid}`; });
            const vidPathsJson = JSON.stringify(vidPaths).replace(/'/g, '&#39;');
            const labelMapJson = JSON.stringify(labels).replace(/'/g, '&#39;');
            
            html += `
            <div class="swiper-slide" data-sync-group="${syncGroup}">
                <h4 class="slide-title" style="text-align: center; margin-bottom: 1rem;">${formatEgoDexTitle(vidName)}</h4>
                <div class="method-selector-single" data-example="${syncGroup}" style="justify-content: center; align-items: center; margin-bottom: 1rem;">
                    <span style="font-weight: bold; margin-right: 15px;">Comparison Method:</span>
                    ${btnHtml}
                </div>
                <div class="comparison-grid-4col" id="${syncGroup}-grid" data-sync-group="${syncGroup}" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Scene & Action</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egodex/scene&action/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Ground Truth</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egodex/gt/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold; color: var(--primary);">EgoSim (Ours)</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egodex/egosim/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col method-comparison-col" data-videos='${vidPathsJson}' data-labels='${labelMapJson}'>
                        <div class="method-label method-video-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">InterDyn</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video method-video" data-src="videos/comparasion/egodex/interdyn/${vid}"><source type="video/mp4"></video>
                    </div>
                </div>
                <div class="sync-play-container" data-sync-control="${syncGroup}" style="margin-top: 1rem;">
                    <button class="sync-play-button" data-target="${syncGroup}">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span class="play-text">Play</span>
                    </button>
                    <div class="sync-progress-bar-container" style="width: auto; flex: 1; max-width: 600px;">
                        <div class="sync-progress-bar"><div class="sync-progress-fill"><div class="sync-progress-handle"></div></div></div>
                        <div class="sync-time-display">0:00 / 0:00</div>
                    </div>
                </div>
            </div>`;
        });
        egodexWrapper.innerHTML = html;
    }

    // 2. EgoVid
    const egovidWrapper = document.getElementById('egovid-wrapper');
    if (egovidWrapper && videoData.egovid) {
        const baselines = ["interdyn", "mask2iv", "coshand", "wan21inpaint"];
        const labels = {
            "interdyn": "InterDyn", 
            "mask2iv": "Mask2IV", 
            "coshand": "CosHand", 
            "wan21inpaint": "Wan2.1-Inpaint"
        };
        
        let html = '';
        videoData.egovid.forEach((vid, idx) => {
            const vidName = vid.replace(".mp4", "");
            const syncGroup = `egovid-${idx}`;
            
            let btnHtml = '';
            baselines.forEach(b => {
                const active = b === "interdyn" ? "active" : "";
                btnHtml += `<button class="method-btn-single ${active}" data-example="${syncGroup}" data-method="${b}" data-label="${labels[b]}">${labels[b]}</button>\n`;
            });
            
            const vidPaths = {};
            baselines.forEach(b => { vidPaths[b] = `videos/comparasion/egovid/${b}/${vid}`; });
            const vidPathsJson = JSON.stringify(vidPaths).replace(/'/g, '&#39;');
            const labelMapJson = JSON.stringify(labels).replace(/'/g, '&#39;');
            
            html += `
            <div class="swiper-slide" data-sync-group="${syncGroup}">
                <h4 class="slide-title" style="text-align: center; margin-bottom: 1rem;">${(typeof egovidLabels !== 'undefined' && egovidLabels[vidName]) || vidName}${(typeof egovidTags !== 'undefined' && egovidTags[vidName]) ? ` <span style="font-size:0.8em; font-weight:normal; color:var(--primary, #00f0ff);">(${egovidTags[vidName]})</span>` : ''}</h4>
                <div class="method-selector-single" data-example="${syncGroup}" style="justify-content: center; align-items: center; margin-bottom: 1rem;">
                    <span style="font-weight: bold; margin-right: 15px;">Comparison Method:</span>
                    ${btnHtml}
                </div>
                <div class="comparison-grid-4col" id="${syncGroup}-grid" data-sync-group="${syncGroup}" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Scene & Action</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egovid/scene&action/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Ground Truth</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egovid/gt/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold; color: var(--primary);">EgoSim (Ours)</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/egovid/egosim/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col method-comparison-col" data-videos='${vidPathsJson}' data-labels='${labelMapJson}'>
                        <div class="method-label method-video-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">InterDyn</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video method-video" data-src="videos/comparasion/egovid/interdyn/${vid}"><source type="video/mp4"></video>
                    </div>
                </div>
                <div class="sync-play-container" data-sync-control="${syncGroup}" style="margin-top: 1rem;">
                    <button class="sync-play-button" data-target="${syncGroup}">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span class="play-text">Play</span>
                    </button>
                    <div class="sync-progress-bar-container" style="width: auto; flex: 1; max-width: 600px;">
                        <div class="sync-progress-bar"><div class="sync-progress-fill"><div class="sync-progress-handle"></div></div></div>
                        <div class="sync-time-display">0:00 / 0:00</div>
                    </div>
                </div>
            </div>`;
        });
        egovidWrapper.innerHTML = html;
    }

    // 3. EgoCap Results
    const egocapWrapper = document.getElementById('egocap-wrapper');
    if (egocapWrapper && videoData.egocap) {
        let html = '';
        videoData.egocap.forEach((vid, idx) => {
            const vidName = vid.replace(".mp4", "");
            const syncGroup = `egocap-${idx}`;
            
            html += `
            <div class="swiper-slide" data-sync-group="${syncGroup}">
                <h4 class="slide-title" style="text-align: center; margin-bottom: 1rem;">${(typeof egocapLabels !== 'undefined' && egocapLabels[vidName]) || vidName}</h4>
                <div class="comparison-grid-3col" id="${syncGroup}-grid" data-sync-group="${syncGroup}" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Scene & Action</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/egocap/scene&action/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Ground Truth</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/egocap/gt/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold; color: var(--primary);">EgoSim (Ours)</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/egocap/egosim/${vid}"><source type="video/mp4"></video>
                    </div>
                </div>
                <div class="sync-play-container" data-sync-control="${syncGroup}" style="margin-top: 1rem;">
                    <button class="sync-play-button" data-target="${syncGroup}">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span class="play-text">Play</span>
                    </button>
                    <div class="sync-progress-bar-container" style="width: auto; flex: 1; max-width: 600px;">
                        <div class="sync-progress-bar"><div class="sync-progress-fill"><div class="sync-progress-handle"></div></div></div>
                        <div class="sync-time-display">0:00 / 0:00</div>
                    </div>
                </div>
            </div>`;
        });
        egocapWrapper.innerHTML = html;
    }

    // 4. Agibot Ablation
    const agibotWrapper = document.getElementById('agibot-wrapper');
    if (agibotWrapper && videoData.agibot) {
        let html = '';
        videoData.agibot.forEach((vid, idx) => {
            const vidName = vid.replace(".mp4", "");
            const syncGroup = `agibot-${idx}`;
            
            html += `
            <div class="swiper-slide" data-sync-group="${syncGroup}">
                <h4 class="slide-title" style="text-align: center; margin-bottom: 1rem;">${(typeof agibotLabels !== 'undefined' && agibotLabels[vidName]) || vidName}</h4>
                <div class="comparison-grid-4col" id="${syncGroup}-grid" data-sync-group="${syncGroup}" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Scene & Action</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/agibot/scene&action/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">Ground Truth</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/agibot/gt/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold; color: var(--primary);">w. hand data pretrain</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/agibot/egosim/${vid}"><source type="video/mp4"></video>
                    </div>
                    <div class="method-col">
                        <div class="method-label" style="text-align: center; margin-bottom: 5px; font-weight: bold;">w/o hand data pretrain</div>
                        <video loop muted playsinline preload="metadata" class="lazy-video sync-video" data-src="videos/comparasion/agibot/wopretrain/${vid}"><source type="video/mp4"></video>
                    </div>
                </div>
                <div class="sync-play-container" data-sync-control="${syncGroup}" style="margin-top: 1rem;">
                    <button class="sync-play-button" data-target="${syncGroup}">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span class="play-text">Play</span>
                    </button>
                    <div class="sync-progress-bar-container" style="width: auto; flex: 1; max-width: 600px;">
                        <div class="sync-progress-bar"><div class="sync-progress-fill"><div class="sync-progress-handle"></div></div></div>
                        <div class="sync-time-display">0:00 / 0:00</div>
                    </div>
                </div>
            </div>`;
        });
        agibotWrapper.innerHTML = html;
    }

    // Initialize Swipers
    function makeUnloadHook() {
        return function(swiper) {
            swiper.slides.forEach((slide, i) => {
                const dist = Math.abs(i - swiper.activeIndex);
                // Only unload slides that are far away (>=3 away)
                if (dist >= 3) {
                    slide.querySelectorAll('video').forEach(video => {
                        const source = video.querySelector('source');
                        if (source && source.src && video.paused) {
                            source.src = '';
                            video.load();
                        }
                    });
                }
            });
        };
    }

    const swiperOptions = {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        allowTouchMove: false, // Prevent swiping while interacting with videos
        on: {
            slideChange: function() {
                // Pause all videos when changing slides
                document.querySelectorAll('video').forEach(v => v.pause());
                document.querySelectorAll('.sync-play-button').forEach(btn => {
                    btn.classList.remove('playing');
                    const text = btn.querySelector('.play-text');
                    if (text) text.textContent = 'Play';
                });
                // Reload videos in current and adjacent slides if they were unloaded
                const swiper = this;
                swiper.slides.forEach((slide, i) => {
                    if (Math.abs(i - swiper.activeIndex) <= 1) {
                        slide.querySelectorAll('video').forEach(video => {
                            const source = video.querySelector('source');
                            if (source && !source.src && video.dataset.src) {
                                source.src = video.dataset.src;
                                video.load();
                            }
                        });
                    }
                });
                makeUnloadHook()(this);
            }
        }
    };
    
    new Swiper('.egodex-swiper', swiperOptions);
    new Swiper('.egovid-swiper', swiperOptions);
    new Swiper('.egocap-swiper', swiperOptions);
    new Swiper('.agibot-swiper', swiperOptions);
}

document.addEventListener('DOMContentLoaded', generateSlides);
