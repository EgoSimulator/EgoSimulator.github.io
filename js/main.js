/**
 * EgoSim Project Page - Main JavaScript
 * Interactive controls and optimizations
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initLazyVideoLoading();
    initSingleMethodSelectors();
    initDualMethodSelectors();
    initInlineSliders();
    initDatasetSliders();
    initSyncPlayButtons();
    initDatasetTabs();
    initSmoothScrolling();
    initNavigationHighlight();
    initVideoPlayControls();
});

/**
 * Lazy video loading using Intersection Observer
 * Videos are loaded only when they're about to enter the viewport
 */
function initLazyVideoLoading() {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const source = video.querySelector('source');

            if (entry.isIntersecting) {
                // Load video source from data-src attribute
                if (source && video.dataset.src && !source.src) {
                    source.src = video.dataset.src;
                    video.load();
                    video.addEventListener('loadeddata', () => {
                        video.currentTime = 0;
                    }, { once: true });
                }
            } else {
                // Unload video when far off-screen to free memory
                // Only unload if not currently playing and source is loaded
                if (source && source.src && video.paused) {
                    video.pause();
                    source.src = '';
                    video.load(); // triggers browser to release buffered data
                }
            }
        });
    }, {
        rootMargin: '300px 0px 300px 0px' // preload slightly ahead, unload when far away
    });

    const lazyVideos = document.querySelectorAll('.lazy-video');
    lazyVideos.forEach(video => {
        videoObserver.observe(video);
    });
}

/**
 * Method selector for 4-column layout
 * Select ONE method to compare in the 4th column
 */
function initSingleMethodSelectors() {
    // Use event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.method-btn-single');
        if (!button) return;
        
        const example = button.dataset.example;
        const method = button.dataset.method;
        const label = button.dataset.label;

        // If already active, do nothing
        if (button.classList.contains('active')) return;

        // Deactivate all buttons for this example
        document.querySelectorAll(`.method-btn-single[data-example="${example}"]`).forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate clicked button
        button.classList.add('active');

        // Update the 4th column comparison
        updateDatasetComparison(example, method, label);
    });

    console.log('Single method selectors initialized (delegated)');
}

/**
 * Update 4th column comparison when method selection changes
 */
function updateDatasetComparison(example, method, label) {
    const grid = document.getElementById(`${example}-grid`);
    if (!grid) return;

    const compCol = grid.querySelector('.method-comparison-col');
    if (!compCol) return;

    const videoUrls = JSON.parse(compCol.dataset.videos || '{}');
    
    const methodVideo = compCol.querySelector('.method-video');
    const methodLabel = compCol.querySelector('.method-video-label');

    if (methodVideo && videoUrls[method]) {
        const source = methodVideo.querySelector('source');
        const newSrc = videoUrls[method];

        // Get current playback state from sibling videos (like the primary Scene & Action video)
        const refVideos = grid.querySelectorAll('.sync-video');
        let currentTime = 0;
        let wasPlaying = false;
        for (const v of refVideos) {
            if (v !== methodVideo && v.duration) {
                currentTime = v.currentTime;
                wasPlaying = !v.paused;
                break;
            }
        }

        // Update video source
        methodVideo.dataset.src = newSrc;
        source.src = newSrc;
        methodVideo.load();

        methodVideo.addEventListener('loadeddata', function onLoad() {
            methodVideo.currentTime = currentTime;
            if (wasPlaying) methodVideo.play().catch(() => {});
            methodVideo.removeEventListener('loadeddata', onLoad);
        });
    }

    if (methodLabel) {
        methodLabel.textContent = label;
    }
}

/**
 * Initialize dataset comparison sliders
 */
function initDatasetSliders() {
    document.querySelectorAll('.inline-video-compare-single').forEach(container => {
        const slider = container.querySelector('.compare-slider');
        const handle = container.querySelector('.compare-handle');
        const rightSide = container.querySelector('.compare-right');
        const leftVideo = container.querySelector('.compare-left video');
        const rightVideo = container.querySelector('.compare-right video');

        let isDragging = false;

        let rafId = null;
        let containerRect = null;

        function updatePosition(percentage) {
            rightSide.style.clipPath = `inset(0 0 0 ${percentage}%)`;
            slider.style.left = `${percentage}%`;
        }

        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            slider.classList.add('dragging');
            // Cache rect once at drag start
            containerRect = container.getBoundingClientRect();
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            // Cancel previous animation frame if still pending
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // Throttle updates using requestAnimationFrame (60fps max)
            rafId = requestAnimationFrame(() => {
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const x = clientX - containerRect.left;
                const percentage = Math.max(2, Math.min(98, (x / containerRect.width) * 100));
                updatePosition(percentage);
            });
        }

        function stopDrag() {
            isDragging = false;
            slider.classList.remove('dragging');
            // Clean up pending animation frame
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            containerRect = null;
        }

        // Mouse events
        slider.addEventListener('mousedown', startDrag);
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        // Touch events
        slider.addEventListener('touchstart', startDrag, { passive: false });
        handle.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);

        // Sync right video time to left video (tight threshold + loop handling)
        leftVideo.addEventListener('timeupdate', () => {
            const drift = rightVideo.currentTime - leftVideo.currentTime;
            const duration = leftVideo.duration || 1;
            // Handle loop boundary (one looped, other didn't)
            if (Math.abs(drift) > duration * 0.5) {
                rightVideo.currentTime = leftVideo.currentTime;
            } else if (Math.abs(drift) > 0.05) {
                rightVideo.currentTime = leftVideo.currentTime;
            }
        });

        // Click on container to play/pause (but not when dragging slider)
        container.addEventListener('click', (e) => {
            if (e.target === slider || e.target === handle) return;
            if (leftVideo.paused) {
                rightVideo.currentTime = leftVideo.currentTime;
                leftVideo.play().catch(() => {});
                rightVideo.play().catch(() => {});
            } else {
                leftVideo.pause();
                rightVideo.pause();
            }
        });

        // Initialize at 50%
        updatePosition(50);
    });

    console.log('Dataset comparison sliders initialized');
}

/**
 * Dual method selector: select exactly 2 methods for inline slider comparison
 */
function initDualMethodSelectors() {
    // Track selection order per example: {exampleId: [oldestMethod, newestMethod]}
    const selections = {};

    // Initialize from active buttons
    document.querySelectorAll('.method-selector-dual').forEach(selector => {
        const example = selector.dataset.example;
        const activeButtons = selector.querySelectorAll('.method-btn-dual.active');
        selections[example] = Array.from(activeButtons).map(btn => btn.dataset.method);

        // Apply initial sorting on page load
        if (selections[example].length === 2) {
            updateInlineSlider(example, selections[example]);
        }
    });

    // Button click handler
    document.querySelectorAll('.method-btn-dual').forEach(button => {
        button.addEventListener('click', function() {
            const example = this.dataset.example;
            const method = this.dataset.method;
            const currentSelections = selections[example];

            // Already selected - do nothing (must always have 2)
            if (this.classList.contains('active')) {
                return;
            }

            // Remove oldest selection if already 2
            if (currentSelections.length >= 2) {
                const removed = currentSelections.shift();
                const removedBtn = document.querySelector(
                    `.method-btn-dual[data-example="${example}"][data-method="${removed}"]`
                );
                if (removedBtn) removedBtn.classList.remove('active');
            }

            // Add new selection
            currentSelections.push(method);
            this.classList.add('active');

            // Update the inline slider
            updateInlineSlider(example, currentSelections);

            console.log(`Example ${example}: comparing ${currentSelections[0]} vs ${currentSelections[1]}`);
        });
    });

    console.log('Dual method selectors initialized');
}

/**
 * Update inline slider videos and labels when method selection changes
 */
function updateInlineSlider(example, selections) {
    const container = document.querySelector(`.inline-video-compare[data-example="${example}"]`);
    if (!container || selections.length < 2) return;

    const videoUrls = JSON.parse(container.dataset.videos);
    const labelMap = JSON.parse(container.dataset.labels);

    // Define button order (left to right)
    const methodOrder = ['interdyn', 'mask2iv', 'coshand', 'wan-control', 'ours'];

    // Sort selections by button position (left to right)
    const sortedMethods = selections.slice().sort((a, b) => {
        return methodOrder.indexOf(a) - methodOrder.indexOf(b);
    });

    const leftMethod = sortedMethods[0];
    const rightMethod = sortedMethods[1];

    const leftVideo = container.querySelector('.compare-left video');
    const rightVideo = container.querySelector('.compare-right video');
    const leftLabel = container.querySelector('.hover-label-left');
    const rightLabel = container.querySelector('.hover-label-right');

    // Get current playback state from sibling sync videos
    const grid = document.getElementById(`example-${example}-grid`);
    const refVideos = grid.querySelectorAll('.sync-video');
    let currentTime = 0;
    let wasPlaying = false;
    for (const v of refVideos) {
        if (v !== leftVideo && v !== rightVideo && v.duration) {
            currentTime = v.currentTime;
            wasPlaying = !v.paused;
            break;
        }
    }

    // Helper to switch a video source
    function switchVideo(video, newSrc) {
        const source = video.querySelector('source');
        const currentSrc = source.src || '';
        // Check if already loaded with this src
        if (currentSrc.endsWith(newSrc)) return;

        video.dataset.src = newSrc;
        source.src = newSrc;
        video.load();
        video.addEventListener('loadeddata', function onLoad() {
            video.currentTime = currentTime;
            if (wasPlaying) video.play().catch(() => {});
            video.removeEventListener('loadeddata', onLoad);
        });
    }

    // Update videos
    if (videoUrls[leftMethod]) switchVideo(leftVideo, videoUrls[leftMethod]);
    if (videoUrls[rightMethod]) switchVideo(rightVideo, videoUrls[rightMethod]);

    // Update labels
    if (leftLabel) leftLabel.textContent = labelMap[leftMethod] || leftMethod;
    if (rightLabel) rightLabel.textContent = labelMap[rightMethod] || rightMethod;
}

/**
 * Initialize inline video comparison sliders (drag to reveal)
 */
function initInlineSliders() {
    document.querySelectorAll('.inline-video-compare').forEach(container => {
        const slider = container.querySelector('.compare-slider');
        const handle = container.querySelector('.compare-handle');
        const rightSide = container.querySelector('.compare-right');
        const leftVideo = container.querySelector('.compare-left video');
        const rightVideo = container.querySelector('.compare-right video');

        let isDragging = false;

        let rafId = null;
        let containerRect = null;

        function updatePosition(percentage) {
            rightSide.style.clipPath = `inset(0 0 0 ${percentage}%)`;
            slider.style.left = `${percentage}%`;
        }

        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            slider.classList.add('dragging');
            // Cache rect once at drag start
            containerRect = container.getBoundingClientRect();
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            // Cancel previous animation frame if still pending
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // Throttle updates using requestAnimationFrame (60fps max)
            rafId = requestAnimationFrame(() => {
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const x = clientX - containerRect.left;
                const percentage = Math.max(2, Math.min(98, (x / containerRect.width) * 100));
                updatePosition(percentage);
            });
        }

        function stopDrag() {
            isDragging = false;
            slider.classList.remove('dragging');
            // Clean up pending animation frame
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            containerRect = null;
        }

        // Mouse events
        slider.addEventListener('mousedown', startDrag);
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        // Touch events
        slider.addEventListener('touchstart', startDrag, { passive: false });
        handle.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);

        // Sync right video time to left video (tight threshold + loop handling)
        leftVideo.addEventListener('timeupdate', () => {
            const drift = rightVideo.currentTime - leftVideo.currentTime;
            const duration = leftVideo.duration || 1;
            // Handle loop boundary (one looped, other didn't)
            if (Math.abs(drift) > duration * 0.5) {
                rightVideo.currentTime = leftVideo.currentTime;
            } else if (Math.abs(drift) > 0.05) {
                rightVideo.currentTime = leftVideo.currentTime;
            }
        });

        // Click on container to play/pause (but not when dragging slider)
        container.addEventListener('click', (e) => {
            // Don't toggle play if we were dragging
            if (e.target === slider || e.target === handle) return;
            if (leftVideo.paused) {
                rightVideo.currentTime = leftVideo.currentTime;
                leftVideo.play().catch(() => {});
                rightVideo.play().catch(() => {});
            } else {
                leftVideo.pause();
                rightVideo.pause();
            }
        });

        // Initialize at 50%
        updatePosition(50);
    });

    console.log('Inline video sliders initialized');
}

/**
 * Synchronized video playback with progress bar
 * Plays all videos in a sync group together with active drift correction
 */
function initSyncPlayButtons() {
    const syncContainers = document.querySelectorAll('.sync-play-container');

    syncContainers.forEach(container => {
        const targetGroup = container.getAttribute('data-sync-control') || container.querySelector('.sync-play-button')?.dataset.target;
        if (!targetGroup) return;

        // Check if this is a sequential player (continuous generation)
        if (container.querySelector('.seq-play-button') !== null) {
            const grid = document.querySelector(`[data-sync-group="${targetGroup}"]`);
            if (grid) initSequentialPlayer(container, grid);
            return;
        }

        const button = container.querySelector('.sync-play-button');
        const progressBar = container.querySelector('.sync-progress-bar');
        const progressFill = container.querySelector('.sync-progress-fill');
        const progressHandle = container.querySelector('.sync-progress-handle');
        const timeDisplay = container.querySelector('.sync-time-display');
        if (!button || !progressBar) return;

        // Find the grid - could be a direct data-sync-group element or nested
        const grid = document.querySelector(`#${targetGroup}-grid`) ||
                     document.querySelector(`[data-sync-group="${targetGroup}"] .comparison-grid-4col`) ||
                     document.querySelector(`[data-sync-group="${targetGroup}"] .comparison-grid-3col`) ||
                     document.querySelector(`[data-sync-group="${targetGroup}"]`);

        if (!grid) {
            console.error(`Sync group not found: ${targetGroup}`);
            return;
        }

        const videos = grid.querySelectorAll('.sync-video');
        if (videos.length === 0) return;

        // Use first video as reference for duration and progress
        const primaryVideo = videos[0];
        let syncRAF = null;
        let isGroupPlaying = false;

        // Format time in MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        // Update progress bar and time display
        function updateProgress() {
            if (!primaryVideo.duration) return;

            const progress = (primaryVideo.currentTime / primaryVideo.duration) * 100;
            progressFill.style.width = `${progress}%`;
            timeDisplay.textContent = `${formatTime(primaryVideo.currentTime)} / ${formatTime(primaryVideo.duration)}`;
        }

        // Active sync loop: keeps all videos aligned to primaryVideo
        function syncLoop() {
            if (!isGroupPlaying) return;

            const refTime = primaryVideo.currentTime;
            const duration = primaryVideo.duration;
            updateProgress();

            videos.forEach(video => {
                if (video === primaryVideo) return;
                if (!video.duration) return;

                const drift = video.currentTime - refTime;

                // Handle loop boundary: if drift is huge, one video looped and the other didn't
                if (Math.abs(drift) > duration * 0.5) {
                    video.currentTime = refTime;
                } else if (Math.abs(drift) > 0.05) {
                    // Correct small drift by seeking
                    video.currentTime = refTime;
                }
            });

            syncRAF = requestAnimationFrame(syncLoop);
        }

        // Start sync loop
        function startSyncLoop() {
            isGroupPlaying = true;
            if (syncRAF) cancelAnimationFrame(syncRAF);
            syncRAF = requestAnimationFrame(syncLoop);
        }

        // Stop sync loop
        function stopSyncLoop() {
            isGroupPlaying = false;
            if (syncRAF) {
                cancelAnimationFrame(syncRAF);
                syncRAF = null;
            }
        }

        // Seek all videos to specific time
        function seekTo(time) {
            videos.forEach(video => {
                video.currentTime = time;
            });
            updateProgress();
        }

        // Handle primary video loop: force all others to restart together
        primaryVideo.addEventListener('seeking', () => {
            if (!isGroupPlaying) return;
            const refTime = primaryVideo.currentTime;
            videos.forEach(video => {
                if (video === primaryVideo) return;
                video.currentTime = refTime;
            });
        });

        // Play button click
        button.addEventListener('click', function() {
            if (isGroupPlaying) {
                // Pause all videos
                videos.forEach(video => video.pause());
                stopSyncLoop();
                button.classList.remove('playing');
                button.querySelector('.play-text').textContent = 'Play';
            } else {
                // Sync all videos to primary before starting
                const startTime = primaryVideo.currentTime;
                const playPromises = [];

                videos.forEach(video => {
                    // Ensure video source is loaded
                    const source = video.querySelector('source');
                    if (!source.src && video.dataset.src) {
                        source.src = video.dataset.src;
                        video.load();
                    }
                    video.currentTime = startTime;
                    playPromises.push(
                        video.play().catch(err => {
                            console.error('Video play error:', err);
                        })
                    );
                });

                // Start sync loop after all videos begin playing
                Promise.all(playPromises).then(() => {
                    startSyncLoop();
                });

                button.classList.add('playing');
                button.querySelector('.play-text').textContent = 'Pause';
            }
        });

        // Progress bar click
        progressBar.addEventListener('click', function(e) {
            if (!primaryVideo.duration) return;

            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * primaryVideo.duration;

            seekTo(newTime);
        });

        // Progress handle drag
        let isDragging = false;

        progressHandle.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging || !primaryVideo.duration) return;

            const rect = progressBar.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
            const newTime = percentage * primaryVideo.duration;

            seekTo(newTime);
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // Video ended handler
        primaryVideo.addEventListener('ended', () => {
            stopSyncLoop();
            button.classList.remove('playing');
            button.querySelector('.play-text').textContent = 'Play';
        });

        // Load metadata to get duration
        primaryVideo.addEventListener('loadedmetadata', () => {
            updateProgress();
        });

        // Pause when out of view
        const groupObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && isGroupPlaying) {
                    videos.forEach(video => video.pause());
                    stopSyncLoop();
                    button.classList.remove('playing');
                    const playText = button.querySelector('.play-text');
                    if (playText) playText.textContent = 'Play';
                }
            });
        }, { threshold: 0.0 });
        groupObserver.observe(grid);

        console.log(`Sync control initialized for group: ${targetGroup}`);
    });
}

/**
 * Sequential Video Player for Continuous Generation
 * Plays part 1 (0-60) then part 2 (60-120) sequentially on a single progress bar
 */
function initSequentialPlayer(container, grid) {
    const button = container.querySelector('.seq-play-button');
    const progressBar = container.querySelector('.seq-progress-bar');
    const progressFill = container.querySelector('.seq-progress-fill');

    const part1Videos = Array.from(grid.querySelectorAll('.sync-video-part1'));
    const part2Videos = Array.from(grid.querySelectorAll('.sync-video-part2'));

    if (part1Videos.length === 0 || part2Videos.length === 0) return;

    let isPlaying = false;
    let currentPart = 1;
    let rafId = null;
    let duration1 = 0;
    let duration2 = 0;

    [...part1Videos, ...part2Videos].forEach(v => {
        v.muted = true;
        v.loop = false;
        if (v.readyState === 0) v.load();
    });

    part1Videos[0].addEventListener('loadedmetadata', () => {
        duration1 = part1Videos[0].duration || (60 / 16);
    });
    part2Videos[0].addEventListener('loadedmetadata', () => {
        duration2 = part2Videos[0].duration || (60 / 16);
    });

    function getD1() { return duration1 || (60 / 16); }
    function getD2() { return duration2 || (60 / 16); }

    function updateProgressBar() {
        const d1 = getD1(), d2 = getD2();
        const total = d1 + d2;
        const refVideo = currentPart === 1 ? part1Videos[0] : part2Videos[0];
        const elapsed = currentPart === 1
            ? (refVideo.currentTime || 0)
            : (d1 + (refVideo.currentTime || 0));
        progressFill.style.width = `${Math.min(elapsed / total, 1) * 100}%`;
    }

    function syncGroup(videos) {
        if (videos.length <= 1) return;
        const ref = videos[0].currentTime;
        for (let i = 1; i < videos.length; i++) {
            if (Math.abs(videos[i].currentTime - ref) > 0.08) {
                videos[i].currentTime = ref;
            }
        }
    }

    function progressLoop() {
        if (!isPlaying) return;
        syncGroup(currentPart === 1 ? part1Videos : part2Videos);
        updateProgressBar();
        rafId = requestAnimationFrame(progressLoop);
    }

    function stopLoop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function pauseAll() {
        [...part1Videos, ...part2Videos].forEach(v => v.pause());
    }

    function startPart2() {
        currentPart = 2;
        part1Videos.forEach(v => { v.currentTime = v.duration || getD1(); });
        part2Videos.forEach(v => { v.currentTime = 0; });
        part2Videos.forEach(v => v.play().catch(() => {}));
    }

    function onFinished() {
        isPlaying = false;
        currentPart = 1;
        stopLoop();
        pauseAll();
        button.querySelector('.play-text').textContent = 'Play';
        button.classList.remove('playing');
        part1Videos.forEach(v => { v.currentTime = 0; });
        part2Videos.forEach(v => { v.currentTime = 0; });
        progressFill.style.width = '0%';
    }

    // Part 1 ends → auto-advance to part 2
    part1Videos[0].addEventListener('ended', () => {
        if (isPlaying && currentPart === 1) startPart2();
    });

    // Part 2 ends → reset
    part2Videos[0].addEventListener('ended', () => {
        if (isPlaying && currentPart === 2) onFinished();
    });

    function doPlay() {
        isPlaying = true;
        button.querySelector('.play-text').textContent = 'Pause';
        button.classList.add('playing');
        const activeVideos = currentPart === 1 ? part1Videos : part2Videos;
        Promise.all(activeVideos.map(v => v.play().catch(() => {}))).then(() => {
            rafId = requestAnimationFrame(progressLoop);
        });
    }

    function doPause() {
        isPlaying = false;
        stopLoop();
        pauseAll();
        button.querySelector('.play-text').textContent = 'Play';
        button.classList.remove('playing');
    }

    button.addEventListener('click', () => {
        if (isPlaying) doPause(); else doPlay();
    });

    // Seek on progress bar click/drag
    function seekTo(ratio) {
        const d1 = getD1(), d2 = getD2();
        const total = d1 + d2;
        const target = ratio * total;
        const wasPlaying = isPlaying;
        if (wasPlaying) { stopLoop(); pauseAll(); }

        if (target <= d1) {
            currentPart = 1;
            part1Videos.forEach(v => { v.currentTime = target; });
            part2Videos.forEach(v => { v.currentTime = 0; });
        } else {
            currentPart = 2;
            part1Videos.forEach(v => { v.currentTime = d1; });
            part2Videos.forEach(v => { v.currentTime = target - d1; });
        }
        progressFill.style.width = `${ratio * 100}%`;

        if (wasPlaying) {
            const active = currentPart === 1 ? part1Videos : part2Videos;
            active.forEach(v => v.play().catch(() => {}));
            rafId = requestAnimationFrame(progressLoop);
        }
    }

    let isDragging = false;
    const handleSeek = (e) => {
        const rect = progressBar.getBoundingClientRect();
        seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };
    progressBar.addEventListener('mousedown', (e) => { isDragging = true; handleSeek(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) handleSeek(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // Pause when out of view
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && isPlaying) doPause();
        });
    }, { threshold: 0.0 }).observe(grid);

    console.log('Sequential player initialized');
}

/**
 * Dataset tabs switching (ARCTIC, HOT3D, HOI4D)
 */
function initDatasetTabs() {
    const tabButtons = document.querySelectorAll('.dataset-tab');
    const tabContents = document.querySelectorAll('.dataset-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');

            // Show corresponding panel
            const dataset = button.dataset.dataset;
            const panel = document.getElementById(`${dataset}-content`);
            if (panel) {
                panel.classList.add('active');
            }

            console.log(`Switched to ${dataset.toUpperCase()} dataset`);
        });
    });

    console.log('Dataset tabs initialized');
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;  // Ignore empty hash

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Scroll to element with offset for sticky nav
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log('Smooth scrolling initialized');
}

/**
 * Highlight active navigation link based on scroll position
 */
function initNavigationHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;
        const navHeight = document.getElementById('navbar').offsetHeight;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        let currentSection = '';

        // Check if we're at the bottom of the page (within 50px)
        const isAtBottom = scrollY + windowHeight >= documentHeight - 50;

        if (isAtBottom && sections.length > 0) {
            // If at bottom, highlight the last section
            currentSection = sections[sections.length - 1].getAttribute('id');
        } else {
            // Normal detection: find which section we're in
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - 100;
                const sectionHeight = section.clientHeight;

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });
        }

        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Throttle scroll event
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(highlightNavigation);
    });

    // Initial highlight
    highlightNavigation();

    console.log('Navigation highlight initialized');
}

/**
 * Video error handling
 */
function initVideoPlayControls() {
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('error', function(e) {
            console.error('Video loading error:', video.dataset.src || video.src, e);
        });
    });
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Log initialization
console.log('EgoSim project page scripts loaded');
