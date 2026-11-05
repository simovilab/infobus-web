<template>
  <BlueprintPage path="/">
    <RecentlyVisitedPages />
    <AlertsDigest />
    <div class="grid gap-6 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-4">
      <RoutesBanner />
      <StopsBanner />
      <TripsBanner />
      <FaresBanner />
      <AlertsBanner />
      <NewsBanner />
      <EventsBanner />
      <BlogBanner />
    </div>
  </BlueprintPage>
</template>
