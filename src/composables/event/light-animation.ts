import { onMounted, onUnmounted } from 'vue';

interface Point {
    x: number;
    y: number;
}

interface Light {
    element: HTMLDivElement;
    currentPointIndex: number;
    speed: number;
    active: boolean;
    timeout: number | null;
}

export function useRollingAnimation(selector: string = '.spinner-window') {
    // Configuration
    const numberOfLights = 3;
    const numberOfPoints = 40;
    const lightColors = [
        'rgba(255, 215, 0, 1)',
        'rgba(255, 165, 0, 1)',
        'rgba(255, 215, 0, 1)'
    ];
    const lightSizes = [12, 12, 12];
    const lightShadows = [
        '0 0 10px 5px rgba(255, 215, 0, 0.7)',
        '0 0 10px 5px rgba(255, 165, 0, 0.7)',
        '0 0 10px 5px rgba(255, 215, 0, 0.7)'
    ];
    const speeds = [100, 120, 80];
    const delays = [0, 2000, 4000];

    // Internal state
    let container: HTMLElement | null = null;
    let spinnerContainer: HTMLElement | null = null;
    const pathPoints: Point[] = [];
    const lights: Light[] = [];

    // Get border width
    const getBorderWidth = (element: HTMLElement): number => {
        const style = window.getComputedStyle(element);
        const borderWidth = parseInt(style.borderWidth || '0', 10);
        return isNaN(borderWidth) ? 2 : borderWidth;
    };

    // Create path points around the container's border
    const generatePathPoints = () => {
        if (!container) return;

        pathPoints.length = 0;

        const containerRect = container.getBoundingClientRect();
        const borderWidth = getBorderWidth(container);

        const width = containerRect.width;
        const height = containerRect.height;

        // Top edge (left to right)
        for (let i = 0; i <= numberOfPoints / 4; i++) {
            pathPoints.push({
                x: (width / (numberOfPoints / 4)) * i,
                y: 0
            });
        }

        // Right edge (top to bottom)
        for (let i = 1; i <= numberOfPoints / 4; i++) {
            pathPoints.push({
                x: width,
                y: (height / (numberOfPoints / 4)) * i
            });
        }

        // Bottom edge (right to left)
        for (let i = 1; i <= numberOfPoints / 4; i++) {
            pathPoints.push({
                x: width - (width / (numberOfPoints / 4)) * i,
                y: height
            });
        }

        // Left edge (bottom to top)
        for (let i = 1; i < numberOfPoints / 4; i++) {
            pathPoints.push({
                x: 0,
                y: height - (height / (numberOfPoints / 4)) * i
            });
        }
    };

    // Create a single light element
    const createLightElement = (index: number): HTMLDivElement => {
        const light = document.createElement('div');
        light.className = 'doorprize-rolling-light'; // Ubah classname agar lebih spesifik
        light.style.position = 'absolute';
        light.style.width = `${lightSizes[index]}px`;
        light.style.height = `${lightSizes[index]}px`;
        light.style.backgroundColor = lightColors[index];
        light.style.borderRadius = '50%';
        light.style.boxShadow = lightShadows[index];
        light.style.zIndex = '10';
        light.style.pointerEvents = 'none';
        light.style.opacity = '1';
        light.style.transform = 'translate(-50%, -50%)';

        return light;
    };

    // Move a light along the path
    const moveLight = (light: Light) => {
        if (!light.active || pathPoints.length === 0) return;

        const targetPoint = pathPoints[light.currentPointIndex];

        light.element.style.left = `${targetPoint.x}px`;
        light.element.style.top = `${targetPoint.y}px`;

        light.currentPointIndex = (light.currentPointIndex + 1) % pathPoints.length;

        light.timeout = window.setTimeout(() => moveLight(light), light.speed);
    };

    // Add static dots along the border
    const addBorderDots = (lightContainer: HTMLElement) => {
        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        const width = containerRect.width;
        const height = containerRect.height;

        const topDots = 11;
        const sideDots = 3;

        // Helper function to create a dot
        const createDot = (x: number, y: number): HTMLDivElement => {
            const dot = document.createElement('div');
            dot.className = 'doorprize-border-dot'; // Ubah classname agar lebih spesifik
            dot.style.position = 'absolute';
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
            dot.style.borderRadius = '50%';
            dot.style.boxShadow = '0 0 5px 2px rgba(255, 215, 0, 0.5)';
            dot.style.zIndex = '8';
            dot.style.pointerEvents = 'none';
            dot.style.transform = 'translate(-50%, -50%)';

            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;

            return dot;
        };

        // Create dots along the top border
        for (let i = 0; i <= topDots; i++) {
            if (i === 0 || i === topDots) continue; // Skip corner dots to avoid overlap
            const dot = createDot(
                (width / topDots) * i,
                0
            );
            lightContainer.appendChild(dot);
        }

        // Create dots along the bottom border
        for (let i = 0; i <= topDots; i++) {
            if (i === 0 || i === topDots) continue; // Skip corner dots
            const dot = createDot(
                (width / topDots) * i,
                height
            );
            lightContainer.appendChild(dot);
        }

        // Create dots along the left border
        for (let i = 1; i < sideDots; i++) {
            const dot = createDot(
                0,
                (height / (sideDots + 1)) * i
            );
            lightContainer.appendChild(dot);
        }

        // Create dots along the right border
        for (let i = 1; i < sideDots; i++) {
            const dot = createDot(
                width,
                (height / (sideDots + 1)) * i
            );
            lightContainer.appendChild(dot);
        }

        // Add dots at corners for a complete look
        const cornerDots = [
            { x: 0, y: 0 },                // Top-left
            { x: width, y: 0 },            // Top-right
            { x: width, y: height },       // Bottom-right
            { x: 0, y: height }            // Bottom-left
        ];

        cornerDots.forEach(point => {
            const dot = createDot(point.x, point.y);
            dot.style.width = '8px'; // Slightly larger corner dots
            dot.style.height = '8px';
            lightContainer.appendChild(dot);
        });
    };

    // PENTING: Bersihkan semua elemen animasi yang lama di seluruh halaman
    const cleanupAllExistingAnimations = () => {
        // Hapus semua elemen lampu dan dots
        document.querySelectorAll('.doorprize-rolling-light-container, .doorprize-rolling-light, .doorprize-border-dot').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    };

    // Initialize the animation
    const initAnimation = () => {
        // Bersihkan semua animasi yang sudah ada terlebih dahulu
        cleanupAllExistingAnimations();

        // Secara eksplisit menggunakan selector string untuk mendapatkan spinner-window
        container = document.querySelector('.spinner-container .spinner-window');
        spinnerContainer = document.querySelector('.spinner-container');

        if (!container) {
            console.error(`No element found with selector '.spinner-container .spinner-window'`);
            return;
        }

        if (!spinnerContainer) {
            spinnerContainer = container.parentElement;
        }

        // Get container position for absolute positioning
        const containerRect = container.getBoundingClientRect();
        const containerPosition = window.getComputedStyle(container).position;

        // Create light container and position it OUTSIDE the main container
        // but in exactly the same position
        const lightContainer = document.createElement('div');
        lightContainer.className = 'doorprize-rolling-light-container';
        lightContainer.style.position = 'absolute';
        lightContainer.style.top = '0';
        lightContainer.style.left = '0';
        lightContainer.style.width = `${containerRect.width}px`;
        lightContainer.style.height = `${containerRect.height}px`;
        lightContainer.style.pointerEvents = 'none';
        lightContainer.style.zIndex = '9';

        // Add the light container to the parent of the spinner-window (not inside it)
        // This keeps the spinner content hidden while letting lights be visible
        if (spinnerContainer) {
            spinnerContainer.appendChild(lightContainer);

            // Position it exactly where the spinner-window is
            const spinnerContainerRect = spinnerContainer.getBoundingClientRect();
            const offsetTop = containerRect.top - spinnerContainerRect.top;
            const offsetLeft = containerRect.left - spinnerContainerRect.left;

            lightContainer.style.top = `${offsetTop}px`;
            lightContainer.style.left = `${offsetLeft}px`;
        } else if (container.parentNode) {
            container.parentNode.appendChild(lightContainer);
        }

        // Generate path points 
        generatePathPoints();

        // Add static dots along the border
        addBorderDots(lightContainer);

        // Create and start moving lights
        for (let i = 0; i < numberOfLights; i++) {
            const lightElement = createLightElement(i);
            lightContainer.appendChild(lightElement);

            const startPointIndex = Math.floor(pathPoints.length * (i / numberOfLights));

            const light: Light = {
                element: lightElement,
                currentPointIndex: startPointIndex,
                speed: speeds[i],
                active: false,
                timeout: null
            };

            lights.push(light);

            // Start with delay
            setTimeout(() => {
                light.active = true;
                moveLight(light);
            }, delays[i]);
        }
    };

    // Clean up animation
    const cleanupAnimation = () => {
        lights.forEach(light => {
            if (light.timeout !== null) {
                clearTimeout(light.timeout);
            }
            light.active = false;

            if (light.element.parentNode) {
                light.element.parentNode.removeChild(light.element);
            }
        });

        lights.length = 0;

        // Clean up all instances with the specific class names we defined
        cleanupAllExistingAnimations();
    };

    // Handle window resize
    const handleResize = () => {
        cleanupAnimation();
        initAnimation();
    };

    onMounted(() => {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
            initAnimation();
        }, 100);

        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        cleanupAnimation();
        window.removeEventListener('resize', handleResize);
    });

    // Method for manual reinitialization
    const reinitialize = () => {
        cleanupAnimation();
        setTimeout(() => {
            initAnimation();
        }, 100);
    };

    return {
        initAnimation: reinitialize,
        cleanupAnimation
    };
}