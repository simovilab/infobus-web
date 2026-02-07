<template>
  <UContainer>
    <UPageHeader
      title="Tarifas"
      class="py-[50px]"
    />

    <div class="mt-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Planes y Precios</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Elige el plan que mejor se adapte a tus necesidades. Ofrecemos tarifas flexibles para todos los usuarios.
      </p>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <thead>
            <tr class="bg-blue-50 dark:bg-slate-700">
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Tipo de Tarifa</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Precio</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200 dark:border-slate-700">
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Tarifa General</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">$1.50</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Disponible para todos los usuarios.</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-slate-700">
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Tarifa Reducida</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">$0.75</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Para estudiantes y personas mayores.</td>
            </tr>
            <tr>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Pase Mensual</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">$50.00</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">Viajes ilimitados durante un mes.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UContainer>
</template>
