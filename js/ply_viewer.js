document.addEventListener('DOMContentLoaded', () => {
    // Initialize continuous generation swiper for scenario 1
    new Swiper('.continuous-swiper-1', {
        navigation: {
            nextEl: '.continuous-swiper-1 .swiper-button-next',
            prevEl: '.continuous-swiper-1 .swiper-button-prev',
        },
        pagination: {
            el: '.continuous-swiper-1 .swiper-pagination',
            clickable: true,
        },
        allowTouchMove: false,
        spaceBetween: 50,
    });

    // Initialize continuous generation swiper for scenario 2
    new Swiper('.continuous-swiper-2', {
        navigation: {
            nextEl: '.continuous-swiper-2 .swiper-button-next',
            prevEl: '.continuous-swiper-2 .swiper-button-prev',
        },
        pagination: {
            el: '.continuous-swiper-2 .swiper-pagination',
            clickable: true,
        },
        allowTouchMove: false,
        spaceBetween: 50,
    });

    // Initialize PLY viewers after a short delay to ensure layout is complete
    setTimeout(() => {
        const plyViewers = document.querySelectorAll('.col-3d');
        plyViewers.forEach(container => {
            const plyPath = container.getAttribute('data-ply');
            if (plyPath) {
                initPlyViewer(container, plyPath);
            }
        });
    }, 100);
});

function initPlyViewer(container, plyPath) {
    // Flag to check if viewer is already initialized
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";

    // Verify Three.js libraries are available
    if (typeof THREE === 'undefined') {
        showError(container, 'Three.js not loaded');
        return;
    }

    const PLYLoader = THREE.PLYLoader;
    const OrbitControls = THREE.OrbitControls;

    if (!PLYLoader) {
        showError(container, 'PLYLoader not available');
        return;
    }
    if (!OrbitControls) {
        showError(container, 'OrbitControls not available');
        return;
    }

    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#00f0ff;font-size:0.85rem;z-index:5;text-align:center;pointer-events:none;';
    loadingEl.textContent = 'Loading 3D...';
    container.appendChild(loadingEl);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    // Use fallback size if container dimensions are not yet calculated
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 350;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    camera.position.set(0, 0, 3);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);

    // Parse geometry from ArrayBuffer and add to scene
    function onGeometryReady(geometry) {
        if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
        console.log('PLY loaded:', plyPath, 'vertices:', geometry.attributes.position ? geometry.attributes.position.count : 'N/A');

        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;
        geometry.scale(scale, scale, scale);

        let mesh;
        if (geometry.index === null) {
            const material = new THREE.PointsMaterial({
                size: 0.015,
                vertexColors: geometry.hasAttribute('color')
            });
            if (!geometry.hasAttribute('color')) material.color.set(0x00aaff);
            mesh = new THREE.Points(geometry, material);
        } else {
            const meshMat = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                vertexColors: geometry.hasAttribute('color'),
                flatShading: true
            });
            mesh = new THREE.Mesh(geometry, meshMat);
        }
        mesh.rotation.x = Math.PI;
        scene.add(mesh);
    }

    // Decode base64 string to ArrayBuffer
    function base64ToArrayBuffer(b64) {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    }

    // Parse PLY from ArrayBuffer
    function parsePlyBuffer(buffer) {
        const loader = new PLYLoader();
        const geometry = loader.parse(buffer);
        onGeometryReady(geometry);
    }

    // Load via dynamically injected <script> tag (works with file://)
    function loadViaScriptTag() {
        const jsPath = plyPath.replace('.ply', '_data.js');
        const script = document.createElement('script');
        script.src = jsPath;
        script.onload = () => {
            const b64 = window.__plyData && window.__plyData[plyPath];
            if (b64) {
                loadingEl.textContent = 'Parsing 3D...';
                setTimeout(() => parsePlyBuffer(base64ToArrayBuffer(b64)), 0);
            } else {
                if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
                showError(container, '3D data not found');
            }
        };
        script.onerror = () => {
            if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
            showError(container, '3D unavailable');
        };
        document.head.appendChild(script);
    }

    // Try XHR first (HTTP server), fall back to script tag (file://)
    function loadViaxhr() {
        const loader = new PLYLoader();
        loader.load(
            plyPath,
            onGeometryReady,
            (xhr) => {
                if (xhr.lengthComputable) {
                    loadingEl.textContent = `Loading 3D... ${Math.round(xhr.loaded / xhr.total * 100)}%`;
                }
            },
            () => loadViaScriptTag()
        );
    }

    // If data already preloaded, use it directly; otherwise try XHR then script tag
    if (window.__plyData && window.__plyData[plyPath]) {
        setTimeout(() => parsePlyBuffer(base64ToArrayBuffer(window.__plyData[plyPath])), 0);
    } else {
        loadViaxhr();
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w && h) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });
    resizeObserver.observe(container);
}

function showError(container, msg) {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#ff6b6b;font-size:0.8rem;text-align:center;padding:10px;white-space:pre-line;z-index:5;pointer-events:none;';
    el.textContent = msg;
    container.appendChild(el);
}
