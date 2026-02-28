
class PCVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.renderQueue = [];
    }

    updateBuild(currentBuild) {
        this.container.innerHTML = ''; // Clean slate

        // Define Layers (Order matters!: Z-Index implicitly by DOM order)
        // 1. Case (Background)
        // 2. Mainboard (On top of case)
        // 3. CPU (On Mobo)
        // 4. RAM (On Mobo)
        // 5. PSU (Bottom)
        // 6. GPU (Top most usually)

        // Wrapper to center everything
        const wrapper = document.createElement('div');
        wrapper.className = 'visual-assembly-wrapper';
        this.container.appendChild(wrapper);

        // 1. Case
        if (currentBuild.case) {
            this.addLayer(wrapper, currentBuild.case.image, 'layer-case', 0);
        } else {
            // Default placeholder case if none selected
            // this.addLayer(wrapper, 'assets/default-case-bg.png', 'layer-case', 0);
        }

        // 2. Mainboard
        if (currentBuild.mainboard) {
            this.addLayer(wrapper, currentBuild.mainboard.image, 'layer-mobo', 10);
        }

        // 3. CPU
        if (currentBuild.cpu) {
            this.addLayer(wrapper, currentBuild.cpu.image, 'layer-cpu', 20);
        }

        // 4. RAM
        if (currentBuild.ram) {
            this.addLayer(wrapper, currentBuild.ram.image, 'layer-ram', 20);
        }

        // 5. PSU
        if (currentBuild.psu) {
            this.addLayer(wrapper, currentBuild.psu.image, 'layer-psu', 5); // Behind GPU usually
        }

        // 6. GPU
        if (currentBuild.gpu) {
            this.addLayer(wrapper, currentBuild.gpu.image, 'layer-gpu', 30);
        }

        this.addWatermark(wrapper);
    }

    addLayer(parent, src, className, zIndex) {
        const img = document.createElement('img');
        img.src = src;
        img.className = `visual-layer ${className}`;
        img.style.zIndex = zIndex;
        parent.appendChild(img);
    }

    addWatermark(parent) {
        const div = document.createElement('div');
        div.className = 'visual-watermark';
        div.innerHTML = '<i class="fas fa-desktop"></i> PC Shop Visual Assembly';
        parent.appendChild(div);
    }
}

// Window Global
window.pcVisualizer = null;
