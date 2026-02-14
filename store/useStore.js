import { create } from 'zustand';

const ANIMALS = [
  {
    id: 'qaswa',
    name: 'القصواء',
    title: 'الناقة المباركة',
    description: 'ناقة النبي ﷺ التي حملته في هجرته إلى المدينة المنورة',
    color: '#FFB830',
    emissive: '#FF8C00',
    aura: 'golden',
    position: [-8, 0, -3],
    luminance: 1.0,
    maxLuminance: 5.0,
    interactions: 0,
  },
  {
    id: 'duldul',
    name: 'دُلدُل',
    title: 'البغلة الشريفة',
    description: 'بغلة النبي ﷺ التي أهداها له المقوقس حاكم مصر',
    color: '#00FFCC',
    emissive: '#00CC99',
    aura: 'emerald',
    position: [-2.8, 0, 3],
    luminance: 1.0,
    maxLuminance: 5.0,
    interactions: 0,
  },
  {
    id: 'sakb',
    name: 'السَّكْب',
    title: 'الفرس السريع',
    description: 'فرس النبي ﷺ الأول الذي اشتراه من أعرابي',
    color: '#FF2255',
    emissive: '#CC0033',
    aura: 'crimson',
    position: [2.8, 0, 3],
    luminance: 1.0,
    maxLuminance: 5.0,
    interactions: 0,
  },
  {
    id: 'ufayr',
    name: 'عُفَيْر',
    title: 'الحمار الوفي',
    description: 'حمار النبي ﷺ الذي أهداه له فروة بن عمرو الجذامي',
    color: '#3388FF',
    emissive: '#0055CC',
    aura: 'sapphire',
    position: [8, 0, -3],
    luminance: 1.0,
    maxLuminance: 5.0,
    interactions: 0,
  },
];

const useStore = create((set, get) => ({
  animals: ANIMALS,
  selectedAnimal: null,
  cameraTarget: null,
  audioEnabled: false,

  // Nurture an animal — increases luminance
  nurture: (animalId) => {
    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === animalId
          ? {
              ...a,
              luminance: Math.min(a.luminance + 0.4, a.maxLuminance),
              interactions: a.interactions + 1,
            }
          : a
      ),
    }));
  },

  // Select animal and move camera
  selectAnimal: (animalId) => {
    const animal = get().animals.find((a) => a.id === animalId);
    set({
      selectedAnimal: animalId,
      cameraTarget: animal ? animal.position : null,
    });
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedAnimal: null, cameraTarget: null });
  },

  // Toggle audio
  toggleAudio: () => {
    set((state) => ({ audioEnabled: !state.audioEnabled }));
  },

  // Reset all luminance
  resetAll: () => {
    set((state) => ({
      animals: state.animals.map((a) => ({
        ...a,
        luminance: 1.0,
        interactions: 0,
      })),
      selectedAnimal: null,
      cameraTarget: null,
    }));
  },
}));

export default useStore;
