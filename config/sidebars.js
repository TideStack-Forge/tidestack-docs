/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  gettingStartedSidebar: ['overview', 'getting-started/index'],
  lowCodeSidebar: [
    'low-code/index',
    {
      type: 'category',
      label: '应用开发菜单',
      collapsed: false,
      items: [
        'low-code/development-platform-menus/business-model',
        {
          type: 'category',
          label: '数据与模型',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/data-model',
            'low-code/development-platform-menus/data-dictionary',
          ],
        },
        {
          type: 'category',
          label: '界面设计',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: '前端页面',
              link: {
                type: 'doc',
                id: 'low-code/development-platform-menus/frontend-page',
              },
              items: [
                'low-code/development-platform-menus/ui-model',
                'low-code/development-platform-menus/ui-schema',
              ],
            },
            'low-code/development-platform-menus/theme-style',
          ],
        },
        {
          type: 'category',
          label: '业务逻辑',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/logicflow',
            'low-code/development-platform-menus/approval-workflow',
            'low-code/development-platform-menus/backend-api',
          ],
        },
        {
          type: 'category',
          label: '组织架构',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/builtin-role',
            'low-code/development-platform-menus/builtin-position',
            'low-code/development-platform-menus/personnel-profile-form',
          ],
        },
        {
          type: 'category',
          label: '系统集成',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/external-api',
            'low-code/development-platform-menus/message-queue',
            'low-code/development-platform-menus/notification-template',
          ],
        },
        {
          type: 'category',
          label: '基础配置',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/datasource',
            'low-code/development-platform-menus/config-item',
            'low-code/development-platform-menus/i18n',
          ],
        },
        {
          type: 'category',
          label: '应用管理',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/version-management',
            'low-code/development-platform-menus/app-configuration',
            'low-code/development-platform-menus/module-arrangement',
          ],
        },
        {
          type: 'category',
          label: '运维监控',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/scheduled-task',
            'low-code/development-platform-menus/business-log-template',
          ],
        },
        {
          type: 'category',
          label: '高级功能',
          collapsed: true,
          items: [
            'low-code/development-platform-menus/micro-frontend',
            'low-code/development-platform-menus/backend-extension-package',
            'low-code/development-platform-menus/field-type',
            'low-code/development-platform-menus/component-library',
          ],
        },
        'guide/module/statistics-analysis/index',
      ],
    },
    {
      type: 'category',
      label: '平台管理',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'low-code/platform-management',
      },
      items: [
        'low-code/development-platform-menus/runtime-instance',
        'low-code/development-platform-menus/app-templates',
        'low-code/development-platform-menus/platform-datasource',
        'low-code/development-platform-menus/platform-component-library',
      ],
    },
  ],
  lowCodeGuidesSidebar: [
    'low-code/development-platform-menu-guide',
    'low-code/development-platform-menus/open-apps',
    'low-code/development-platform-menus/developer-docs',
    {
      type: 'category',
      label: '专题说明',
      collapsed: false,
      items: [
        'low-code/overview',
        'low-code/from-requirement-to-delivery',
        'low-code/forms-attachments-and-documents',
        'low-code/page-delivery-with-dynamic-forms-and-ui-schema',
        'low-code/workflow-rules-and-automation',
        'low-code/organization-permissions-configuration-and-notification',
        'low-code/integration-and-scheduled-automation',
      ],
    },
    {
      type: 'category',
      label: '操作教程',
      collapsed: true,
      items: [
        'guide/tutorial/index',
        'guide/tutorial/apps/index',
        'guide/tutorial/business-model/index',
        'guide/tutorial/business-model/develop-business-model/index',
        'guide/tutorial/dict/index',
        'guide/tutorial/arrange-modules/index',
        'guide/tutorial/configuration/index',
        'guide/tutorial/expression/index',
        'guide/tutorial/script/index',
        'guide/tutorial/logicflow/index',
        'guide/tutorial/notification/index',
      ],
    },
    {
      type: 'category',
      label: '模块指南',
      collapsed: true,
      items: [
        'guide/module/index',
        'guide/module/organization/index',
        'guide/module/rbac/index',
        'guide/module/notification/index',
        'guide/module/approval-workflow/index',
        'guide/module/approval-workflow/external-engine/index',
        'guide/module/approval-workflow/approval-start/index',
        'guide/module/approval-workflow/approval-center/index',
        'guide/module/approval-workflow/approval-management/index',
        'guide/module/approval-workflow/approval-statistics/index',
      ],
    },
  ],
  fusionDevelopmentSidebar: [
    'fusion-development/index',
    'guide/advance/index',
    {
      type: 'category',
      label: '开始融合开发',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'fusion-development/overview',
      },
      items: [
        'fusion-development/when-to-use-code',
        'fusion-development/ai-assisted-development',
        'fusion-development/extension-points',
        'fusion-development/high-low-code-collaboration',
      ],
    },
    {
      type: 'category',
      label: '前端开发',
      link: {
        type: 'doc',
        id: 'fusion-development/frontend-extension-paths',
      },
      items: [
        'guide/advance/extend-frontend/application-transformation',
        'guide/advance/extend-frontend/micro-app/index',
        'guide/advance/extend-frontend/layout-component/index',
        'fusion-development/workbench-widgets-and-component-libraries',
        'guide/advance/extend-frontend/index',
        'guide/advance/amis-reference/index',
      ],
    },
    {
      type: 'category',
      label: '后端开发',
      link: {
        type: 'doc',
        id: 'fusion-development/backend-development/index',
      },
      items: [
        'fusion-development/backend-extension-packages',
        'fusion-development/backend-development/data-model',
        'fusion-development/backend-development/business-model',
        'fusion-development/backend-development/logicflow-model',
        'fusion-development/backend-development/rpc-model',
        'fusion-development/backend-development/webapi-model',
        'fusion-development/backend-development/spring-beans-and-controllers',
        'fusion-development/backend-development/message-queue',
        'fusion-development/backend-development/scheduled-tasks',
        'fusion-development/backend-development/supporting-resources',
        'guide/advance/authoring-metadata-conventions/index',
        'fusion-development/development-module-scaffold-and-maven-skeleton',
      ],
    },
    {
      type: 'category',
      label: '插件扩展',
      link: {
        type: 'doc',
        id: 'fusion-development/plugin-extensions/index',
      },
      items: [
        {
          type: 'category',
          label: '前端',
          link: {
            type: 'doc',
            id: 'fusion-development/plugin-extensions/frontend/index',
          },
          items: [
            'fusion-development/plugin-extensions/frontend/platform-component-library',
            'guide/advance/extend-frontend/amis-component/index',
          ],
        },
        {
          type: 'category',
          label: '后端',
          link: {
            type: 'doc',
            id: 'guide/advance/extend-backend/index',
          },
          items: [
            'guide/advance/extend-backend/extend-logicflow/index',
            'guide/advance/extend-backend/extend-script/index',
            'guide/advance/extend-backend/extend-expression/index',
            'guide/advance/extend-backend/extend-field/index',
            'fusion-development/plugin-extensions/backend/script-languages',
            'fusion-development/plugin-extensions/backend/data-field-types',
            'fusion-development/plugin-extensions/backend/data-model-plugins',
            'fusion-development/plugin-extensions/backend/metadata-decorators',
            'fusion-development/plugin-extensions/backend/business-model-plugins',
            'fusion-development/plugin-extensions/backend/upload-storage',
            'fusion-development/plugin-extensions/backend/data-permissions',
            'fusion-development/plugin-extensions/backend/authentication',
            'fusion-development/plugin-extensions/backend/other-extension-points',
          ],
        },
      ],
    },
    'fusion-development/integration-automation-and-realtime',
    {
      type: 'category',
      label: '认证与权限',
      items: [
        'fusion-development/custom-login-page-and-auth-integration',
        'fusion-development/ad-domain-auth-adaptation-guide',
        'fusion-development/oidc-auth-adaptation-guide',
        'fusion-development/cas-auth-adaptation-guide',
        'fusion-development/dingtalk-auth-adaptation-guide',
        'fusion-development/wecom-auth-adaptation-guide',
        'fusion-development/feishu-auth-adaptation-guide',
        'fusion-development/authority-subject-and-access-control-design',
      ],
    },
    {
      type: 'category',
      label: '联调与交付',
      items: [
        'fusion-development/local-ide-and-platform-debugging',
        'fusion-development/development-platform-support-capabilities',
      ],
    },
  ],
  operationsSidebar: [
    'operations/index',
    {
      type: 'category',
      label: '开发平台部署',
      collapsed: false,
      items: [
        'operations/deployment-architecture',
        {
          type: 'category',
          label: '部署方式',
          collapsed: false,
          items: [
            'operations/deployment-methods/docker-compose',
            'operations/deployment-methods/docker-apisix',
            'operations/deployment-methods/remote-docker',
            'operations/deployment-methods/kubernetes',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '配置参考',
      collapsed: false,
      items: [
        'operations/runtime-base-configuration',
        'operations/development-platform-configuration',
      ],
    },
    {
      type: 'category',
      label: '发布与变更',
      collapsed: false,
      items: [
        'operations/application-release-and-rollback',
        'operations/release-upgrade-and-rollback',
      ],
    },
    {
      type: 'category',
      label: '日常维护',
      collapsed: true,
      items: [
        'operations/runtime-capability-maintenance',
        'operations/task-message-and-realtime-link-maintenance',
        'operations/business-logs-and-audit-traceability',
      ],
    },
    {
      type: 'category',
      label: '监控与恢复',
      collapsed: true,
      items: [
        'operations/monitoring-and-alerting',
        'operations/backup-monitoring-and-troubleshooting',
        'operations/troubleshooting',
      ],
    },
  ],
  conceptsSidebar: [
    'concepts/index',
    'concepts/modeling/index',
    'concepts/architecture/index',
    {
      type: 'category',
      label: '业务建模',
      collapsed: true,
      items: [
        'concepts/module-model/index',
        'concepts/business-model/index',
      ],
    },
    {
      type: 'category',
      label: '数据与配置',
      collapsed: true,
      items: [
        'concepts/data-model/index',
        'concepts/field-define/index',
        'concepts/data-dict-model/index',
        'concepts/configuration-model/index',
      ],
    },
    {
      type: 'category',
      label: '页面与导航',
      collapsed: true,
      items: [
        'concepts/menu-model/index',
        'concepts/ui-model/index',
        'concepts/ui-schema/index',
        'concepts/widget-model/index',
        'concepts/micro-web-model/index',
      ],
    },
    {
      type: 'category',
      label: '接口、流程与集成',
      collapsed: true,
      items: [
        'concepts/webapi-model/index',
        'concepts/logicflow-model/index',
        'concepts/approval-workflow-model/index',
        'concepts/rpc-model/index',
      ],
    },
    {
      type: 'category',
      label: '组织与权限',
      collapsed: true,
      items: [
        'concepts/organization-model/index',
        'concepts/authority-model/index',
      ],
    },
    'concepts/supporting-resources/index',
  ],
  aiSidebar: [
    'ai/index',
    'ai/routing-hints',
    'ai/task-recipes',
    'ai/reference-sources',
    'ai/terminology',
  ],
  referenceSidebar: [
    'reference/index',
    'reference/platform-capability-map',
    {
      type: 'category',
      label: 'API 参考',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'api/index',
      },
      items: [
        {
          type: 'category',
          label: '后端 API',
          link: {
            type: 'doc',
            id: 'api/backend/index',
          },
          items: [
            'api/backend/expression-context/index',
            'api/backend/script-context/index',
            {
              type: 'category',
              label: '数据模型 API',
              link: {
                type: 'doc',
                id: 'api/backend/data-model/index',
              },
              items: [
                'api/backend/data-model/data-model-center/index',
                'api/backend/data-model/typed-data-model-center/index',
                'api/backend/data-model/data-model/index',
                'api/backend/data-model/typed-data-model/index',
                'api/backend/data-model/data-model-field/index',
                'api/backend/data-model/data-model-meta/index',
                'api/backend/data-model/data-model-field-meta/index',
                'api/backend/data-model/plugin-descriptor/index',
              ],
            },
            'api/backend/data-query-dsl/index',
            {
              type: 'category',
              label: 'Java API',
              link: {
                type: 'doc',
                id: 'api/backend/java-api/index',
              },
              items: [
                {
                  type: 'category',
                  label: '工具类',
                  items: [{ type: 'autogenerated', dirName: 'api/backend/java-api/util' }],
                },
                {
                  type: 'category',
                  label: '实体定义',
                  items: [{ type: 'autogenerated', dirName: 'api/backend/java-api/entity' }],
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: '前端 API',
          link: {
            type: 'doc',
            id: 'api/frontend/index',
          },
          items: [
            {
              type: 'category',
              label: '前端基座 SDK',
              link: {
                type: 'doc',
                id: 'api/frontend/sdk/index',
              },
              items: [
                'api/frontend/sdk/initialization-methods/index',
                {
                  type: 'category',
                  label: 'SDK 运行时方法',
                  link: {
                    type: 'doc',
                    id: 'api/frontend/sdk/completion-methods/index',
                  },
                  items: [
                    'api/frontend/sdk/completion-methods/navigation-and-tabs-and-dialogs',
                    'api/frontend/sdk/completion-methods/events-schema-and-component-registration',
                    'api/frontend/sdk/completion-methods/request-and-authentication',
                    'api/frontend/sdk/completion-methods/stomp-and-realtime',
                  ],
                },
                'api/frontend/sdk/menu-extension/index',
              ],
            },
            {
              type: 'category',
              label: '基座内建组件',
              link: {
                type: 'doc',
                id: 'api/frontend/buildin-comps/index',
              },
              items: [
                'api/frontend/buildin-comps/schema-and-editor-components',
                'api/frontend/buildin-comps/business-pickers-and-micro-components',
                'api/frontend/buildin-comps/advanced-editor-components',
                'api/frontend/buildin-comps/actions-filters-and-expression-functions',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '规范与元数据',
      collapsed: false,
      items: ['api/web-api-spec/index', 'reference/jsonschema/index'],
    },
    {
      type: 'category',
      label: '常见问题',
      link: {
        type: 'doc',
        id: 'faq/index',
      },
      items: ['faq/backend', 'faq/frontend', 'faq/operations'],
    },
  ],
}

export default sidebars
