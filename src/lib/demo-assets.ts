export const demoEventCovers = {
  sunsetMixer: "/demo/events/sunset-mixer.png",
  triviaNight: "/demo/events/trivia-night.png",
  ceramicsWorkshop: "/demo/events/ceramics-workshop.png",
  beachTennis: "/demo/events/beach-tennis.png",
  dogHappyHour: "/demo/events/dog-happy-hour.png",
  rooftopSocial: "/demo/events/rooftop-social.png",
} as const;

export const demoVenueCovers = {
  patioRestaurant: "/demo/venues/patio-restaurant.png",
  cafeNetworking: "/demo/venues/cafe-networking.png",
  galleryLoft: "/demo/venues/gallery-loft.png",
  yogaStudio: "/demo/venues/yoga-studio.png",
} as const;

export const demoAdminImages = {
  promoCreative: "/demo/admin/promo-creative.png",
  evidenceVault: "/demo/admin/evidence-vault.png",
} as const;

export const demoAvatars = [
  "/demo/avatars/avatar-01.png",
  "/demo/avatars/avatar-02.png",
  "/demo/avatars/avatar-03.png",
  "/demo/avatars/avatar-04.png",
  "/demo/avatars/avatar-05.png",
] as const;

export function demoAvatar(index: number) {
  return demoAvatars[index % demoAvatars.length];
}

export function demoEventCover(index: number) {
  const covers = Object.values(demoEventCovers);
  return covers[index % covers.length];
}

export function demoVenueCover(index: number) {
  const covers = Object.values(demoVenueCovers);
  return covers[index % covers.length];
}
