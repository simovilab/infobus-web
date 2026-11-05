<script setup lang="ts">
const serviceTabs = [
  { label: 'calendar.service_id', icon: 'i-lucide-calendar-days' },
  { label: 'calendar.service_id', icon: 'i-lucide-calendar-days' },
  { label: 'calendar.service_id', icon: 'i-lucide-calendar-days' }
]

const directionTabs = [
  { label: 'trips.direction_id', icon: 'i-lucide-arrow-right' },
  { label: 'trips.direction_id', icon: 'i-lucide-arrow-left' }
]

const tripRows = 3
const stopColumns = 3
</script>

<template>
  <BlueprintCard>
    <template #default="{ structure }">
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="space-y-2">
          <h3 class="text-sm font-medium text-highlighted">
            Service days
          </h3>
          <BlueprintStructure
            :structure="findStructure(structure, 'calendar')"
            root
            :repeat="2"
          />
        </section>
        <section class="space-y-2">
          <h3 class="text-sm font-medium text-highlighted">
            Exceptions (holidays, special days)
          </h3>
          <BlueprintStructure
            :structure="findStructure(structure, 'calendar_dates')"
            root
            :repeat="2"
          />
        </section>
      </div>

      <section class="space-y-3">
        <h3 class="text-sm font-medium text-highlighted">
          Timetable
        </h3>
        <div class="flex flex-wrap items-center gap-4">
          <UTabs
            :items="serviceTabs"
            :content="false"
            color="neutral"
            size="sm"
            :ui="{ trigger: 'font-mono text-xs' }"
          />
          <UTabs
            :items="directionTabs"
            :content="false"
            color="neutral"
            size="sm"
            :ui="{ trigger: 'font-mono text-xs' }"
          />
        </div>
        <BlueprintStructure :structure="ownStructure(findStructure(structure, 'services', 'directions'), 'direction')" />

        <div class="overflow-x-auto rounded-lg border border-dashed border-muted">
          <table class="w-full text-left text-sm">
            <thead class="bg-elevated text-xs text-dimmed">
              <tr>
                <th
                  scope="col"
                  class="p-3 font-medium"
                >
                  trips (one row per trip)
                </th>
                <th
                  v-for="column in stopColumns"
                  :key="column"
                  scope="col"
                  class="p-3 font-medium"
                  :class="column > 1 ? 'opacity-50' : ''"
                >
                  <BlueprintEntity
                    entity="stops.stop_name"
                    compact
                  />
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="row in tripRows"
                :key="row"
                :class="row > 1 ? 'opacity-50' : ''"
              >
                <th
                  scope="row"
                  class="p-3 font-normal"
                >
                  <BlueprintStructure :structure="ownStructure(findStructure(structure, 'services', 'directions', 'trips'), 'trip')" />
                </th>
                <td
                  v-for="column in stopColumns"
                  :key="column"
                  class="p-3 align-top"
                >
                  <BlueprintEntity
                    entity="stop_times.departure_time"
                    compact
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </BlueprintCard>
</template>
