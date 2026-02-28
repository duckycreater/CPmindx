
// 3D Viewer using Three.js
class PCViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.partsGroup = null;
        this.loader = new THREE.TextureLoader();

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.innerHTML = ''; // Clear previous
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 10, 10);
        this.scene.add(dirLight);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
        }

        // Case Geometry (Virtual Chassis)
        this.createVirtualCase();

        // Parts Group
        this.partsGroup = new THREE.Group();
        this.scene.add(this.partsGroup);

        // Resize Listener
        window.addEventListener('resize', () => this.onWindowResize());

        // Start Loop
        this.animate();
    }

    createVirtualCase() {
        // Simple Wireframe Box representing a generic Mid-Tower
        const geometry = new THREE.BoxGeometry(20, 40, 40); // Width, Height, Depth
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x444444 }));
        this.scene.add(line);

        // Glass Panel effect
        const glassGeo = new THREE.PlaneGeometry(40, 40);
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.x = 10; // Side
        glass.rotation.y = Math.PI / 2;
        this.scene.add(glass);
    }

    updateBuild(currentBuild) {
        // Clear old parts
        if (!this.partsGroup) return;
        while (this.partsGroup.children.length > 0) {
            this.partsGroup.remove(this.partsGroup.children[0]);
        }

        // Logic to place parts
        // 1. Motherboard (Backplate)
        if (currentBuild.mainboard) {
            this.addPartPlane(currentBuild.mainboard.image, { width: 30, height: 30 }, { x: -2, y: 0, z: -5 });
        }

        // 2. CPU (Center of Mobo)
        if (currentBuild.cpu) {
            this.addPartPlane(currentBuild.cpu.image, { width: 8, height: 8 }, { x: -2, y: 5, z: -4 });
        }

        // 3. RAM (Right of CPU)
        if (currentBuild.ram) {
            this.addPartPlane(currentBuild.ram.image, { width: 4, height: 15 }, { x: 5, y: 5, z: -4 });
        }

        // 4. GPU (Bottom, Perpendicular usually, but let's flat it for visibility first or angle it)
        if (currentBuild.gpu) {
            this.addPartPlane(currentBuild.gpu.image, { width: 25, height: 10 }, { x: -2, y: -8, z: 0 }); // Floating in front
        }

        // 5. PSU (Bottom)
        if (currentBuild.psu) {
            this.addPartPlane(currentBuild.psu.image, { width: 15, height: 10 }, { x: 0, y: -15, z: 5 });
        }

        // 6. Monitor (Outside?) - Maybe just internal components for now
    }

    addPartPlane(imageUrl, size, position) {
        // Create a plane with the image texture
        this.loader.load(imageUrl, (texture) => {
            const geometry = new THREE.PlaneGeometry(size.width, size.height);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, position.z);
            this.partsGroup.add(mesh);
        });
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Global instance
window.pcViewer = null;
