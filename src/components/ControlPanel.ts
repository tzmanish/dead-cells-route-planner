export function ControlPanel(): string {
  return `
    <div class="banner-dc p-3">
      <!-- Boss Cell Selection -->
      <div class="flex items-center gap-4">
        <p class="text-dc-gold font-bold">Boss Cell (BC):</p>
        <div class="flex flex-wrap gap-2">
          ${[0, 1, 2, 3, 4, 5].map(bc => `
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="boss-cell" 
                value="${bc}" 
                ${bc === 0 ? 'checked' : ''}
                class="radio-dc"
              />
              <span class="text-dc-gold-light">${bc} BC</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- DLC Selection -->
      <div class="flex items-center gap-4">
        <p class="text-dc-gold font-bold">DLCs:</p>
        <div class="flex flex-wrap gap-2">
          ${[
            { code: 'FF', name: 'Fatal Falls' },
            { code: 'RotG', name: 'Return of the Giant' },
            { code: 'RtC', name: 'Return to Castlevania' },
            { code: 'TBS', name: 'The Bad Seed' },
            { code: 'TQatS', name: 'The Queen and the Sea' }
          ].map(dlc => `
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                id="dlc-${dlc.code}" 
                value="${dlc.code}"
                checked
                class="checkbox-dc"
              />
              <span class="text-dc-gold-light">${dlc.code}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Spoilers Toggle -->
      <div>
        <label class="flex items-center gap-2 cursor-pointer w-fit">
          <input 
            type="checkbox" 
            id="spoilers" 
            class="checkbox-dc"
          />
          <span class="text-dc-gold font-bold">Show Spoilers?</span>
        </label>
      </div>
    </div>
  `
}
