import { create } from 'zustand';

const ANIMALS = [
  {
    id: 'qaswa',
    name: 'القصواء',
    title: 'الناقة المباركة',
    description: 'ناقة النبي ﷺ التي حملته في هجرته إلى المدينة المنورة',
    bodyColor: '#C4944A',
    furColor: '#A67B3D',
    position: [-10, 0, -4],
    happiness: 1.0,
    maxHappiness: 5.0,
    interactions: 0,
    sound: 'camel',
  },
  {
    id: 'duldul',
    name: 'دُلدُل',
    title: 'البغلة الشريفة',
    description: 'بغلة النبي ﷺ التي أهداها له المقوقس حاكم مصر',
    bodyColor: '#6B5B4A',
    furColor: '#4A3C2E',
    position: [-3.5, 0, 5],
    happiness: 1.0,
    maxHappiness: 5.0,
    interactions: 0,
    sound: 'mule',
  },
  {
    id: 'sakb',
    name: 'السَّكْب',
    title: 'الفرس السريع',
    description: 'فرس النبي ﷺ الأول الذي اشتراه من أعرابي',
    bodyColor: '#3B2415',
    furColor: '#1A0F08',
    position: [3.5, 0, 5],
    happiness: 1.0,
    maxHappiness: 5.0,
    interactions: 0,
    sound: 'horse',
  },
  {
    id: 'ufayr',
    name: 'عُفَيْر',
    title: 'الحمار الوفي',
    description: 'حمار النبي ﷺ الذي أهداه له فروة بن عمرو الجذامي',
    bodyColor: '#8C8C8C',
    furColor: '#5C5C5C',
    position: [10, 0, -4],
    happiness: 1.0,
    maxHappiness: 5.0,
    interactions: 0,
    sound: 'donkey',
  },
];

const useStore = create((set, get) => ({
  animals: ANIMALS,
  selectedAnimal: null,
  cameraTarget: null,
  audioEnabled: true,
  timeOfDay: 'golden', // 'morning' | 'golden' | 'noon'

  // Nurture / interact with animal
  nurture: (animalId) => {
    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === animalId
          ? {
              ...a,
              happiness: Math.min(a.happiness + 0.4, a.maxHappiness),
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

  clearSelection: () => {
    set({ selectedAnimal: null, cameraTarget: null });
  },

  toggleAudio: () => {
    set((state) => ({ audioEnabled: !state.audioEnabled }));
  },

  resetAll: () => {
    set((state) => ({
      animals: state.animals.map((a) => ({
        ...a,
        happiness: 1.0,
        interactions: 0,
      })),
      selectedAnimal: null,
      cameraTarget: null,
    }));
  },
}));

export default useStore;
