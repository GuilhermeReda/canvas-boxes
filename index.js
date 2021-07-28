/**
 * ---- Index.js ----
 * The route definition present in this file is assumed to be the "root" route definition
 * that will get registered in `config/router/routes.js`
 * It must exports an object named ROUTES_DEFINITION.
 *
 */

import i18n from 'config/vue-i18n';
import { ACL_ACCOUNTING_STATS } from 'common/acls';
import FEATURES from 'common/feature-flags';
import { redirectToPenaltyRestricted } from 'router/penalty-payment-helper';
import { ACCOUNTING_ROUTES_DEFINITION, ACCOUNTING_ROUTES_NAME } from './routes.definition';
import { ACCOUNTING_ROUTES_REDIRECT as ROUTES_REDIRECT } from './routes.redirect';

const Tabs = () =>
  import(/* webpackChunkName: "router-templates-tabs" */ 'config/router/templates/tabs/tabs.vue');

const ROUTES_DEFINITION = {
  path: '/accounting',
  name: ACCOUNTING_ROUTES_NAME.INDEX,
  component: Tabs,
  props: {
    header: i18n.t('Accounting'),
    headerIcon: 'fas fa-chart-pie',
  },
  beforeEnter: redirectToPenaltyRestricted,
  meta: {
    acls: [ACL_ACCOUNTING_STATS],
    features: [FEATURES.ACCOUNTING],
  },
  children: ACCOUNTING_ROUTES_DEFINITION,
};

export { ROUTES_DEFINITION, ROUTES_REDIRECT };
