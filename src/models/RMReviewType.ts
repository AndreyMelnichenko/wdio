interface RMReviewType {
    type?: "google" | "facebook" | "google and facebook",
    google_id?: number,
    facebook_id?: number,
    connected?: "true" | "false"
}

export { RMReviewType }
