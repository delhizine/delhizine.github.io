function openModal(imageSrc, title, review) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalReview').innerText = review;
    document.getElementById('imageModal').style.display = "flex";
}

function closeModal() {
    document.getElementById('imageModal').style.display = "none";
}
