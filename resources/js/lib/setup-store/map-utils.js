export const loadLeaflet = () => {
    return new Promise((resolve) => {
        if (window.L) {
            resolve(window.L);
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
    });
};

export const initMap = (mapRef, initialLat = -6.2088, initialLng = 106.8456) => {
    const L = window.L;
    if (!L || !mapRef.current) return null;

    const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    return map;
};

export const createDraggableMarker = (map, lat, lng, onDragEnd) => {
    const L = window.L;
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", (e) => {
        if (onDragEnd) onDragEnd(e.target.getLatLng());
    });

    return marker;
};