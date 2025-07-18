import ModuleComponent from './module.vue';

export default {
  id: 'food-feedback-comments',
  name: 'Food Feedback Comments',
  icon: 'chat',
  routes: [
    {
      path: '',
      props: true,
      component: ModuleComponent,
    }
  ],
};
