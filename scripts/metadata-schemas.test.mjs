// @vitest-environment node
import {readFileSync} from 'node:fs'
import {describe, expect, test} from 'vitest'
import Ajv2020 from 'ajv/dist/2020.js'

const schemaDirectory = new URL('../docs/reference/jsonschema/metadata/', import.meta.url)
const index = JSON.parse(readFileSync(new URL('index.json', schemaDirectory), 'utf8'))
const ajv = new Ajv2020({allErrors: true, strictTypes: false})
const validators = new Map(index.entries.map(({type, schema}) => [
  type, ajv.compile(JSON.parse(readFileSync(new URL(schema, schemaDirectory), 'utf8'))),
]))

const configuration = {key: 'app.pageSize', label: '每页条数', valueType: 'int', defaultValue: 20, managementEntry: '/settings'}
const group = {path: 'app', title: '应用设置'}
const workflow = {
  name: 'leave', title: '请假', form: {formType: 'dynamicForm', formId: 'leave'},
  nodes: [{id: 'start', type: 'StartNode'}, {id: 'end', type: 'EndNode'}],
  edges: [{id: 'e1', type: 'SEQUENCE', sourceId: 'start', targetId: 'end'}],
}
const business = {
  modelType: 'default', formatVersion: '2.0', name: 'order', title: '订单',
  fields: [{name: 'id', type: 'string', isPrimaryKey: true}],
  actions: [{name: 'submit', isEnabled: true, binding: {kind: 'logicflow', flowName: 'submitOrder'}, emits: [{modelFullName: 'order', eventName: 'submitted'}]}],
  events: [{name: 'submitted', occurrenceCondition: '提交成功', subject: 'model', allowedProducerKinds: ['action']}],
  eventSubscriptions: [{name: 'notify', sourceEventModelFullName: 'order', sourceEventName: 'submitted', listenerName: 'notifyOrder', executionPrincipalRef: 'system'}],
}

const validResources = [
  ['authority', {fullName: 'orders.read', title: '查看订单', delegable: true, accessControlDefine: {fieldSelectionRequired: true, controlledFields: [{name: 'amount', type: 'decimal'}], filterDefine: [{name: 'owner', originalFieldName: 'ownerId', settingSchema: [{type: 'input-text'}]}]}}],
  ['menu', {fullName: 'orders', title: '订单', scope: 'secondary', showMode: 'tab', customBadge: 'new'}],
  ['dev-menu', {fullName: 'models', title: '模型', children: [{fullName: 'models.order', title: '订单', icon: 'table', showMode: 'newWindow', children: [{fullName: 'models.order.edit', title: '编辑'}]}]}],
  ['ui-model', {path: '/orders', type: 'schema', title: '订单', schemaPath: '/orders'}],
  ['ui-schema', {type: 'page', title: {type: 'tpl', tpl: '订单'}, className: {'p-4': true}, body: [{type: 'input-text', name: 'title'}]}],
  ['business', business],
  ['logicflow', {name: 'submitOrder', nodes: [{name: 'start', type: 'Start', outputPorts: [{name: 'out', dataType: 'any'}], pluginProperty: {enabled: true}}], connections: [{sourceNode: 'start', sourceOutputPort: 0, targetNode: 'end', targetInputPort: 0}], nodePositions: {start: {x: 1.5, y: 2}}, validationDiagnostics: [{diagnosticKind: 'port', portIndex: 0}], validationState: 'INVALID'}],
  ['approval-workflow', workflow],
  ['field-type', {name: 'code', label: '编码', source: 'JAR', paramsUiSchema: [{type: 'input-text', name: 'prefix'}], defaultParams: {prefix: 'ORD'}}],
  ['flow-node', {type: 'Transform', label: '转换', portRules: {input: {required: true}}, properties: [{name: 'expression'}], svgs: {icon: '<svg/>'}}],
  ['widget', {name: 'orders', title: '订单', schemaTpl: '${config}', defaultSize: {cols: 6, rows: 3}, sizeConstraints: {min: {cols: 2, rows: 1}}, defaultConfig: {showHeader: true, api: '/orders'}, configFormItems: [{type: 'input-text'}]}],
  ['micro-web', {name: 'app-shell', type: 'app', entry: '/shell/'}],
  ['rpc', {name: 'orders', title: '订单服务', type: 'custom-http', request: {url: '/orders'}, pluginOption: 1}],
  ['rpc-auth', {name: 'orders', title: '订单认证', type: 'custom-token', tokenSource: 'configuration'}],
  ['webapi', {method: 'POST', path: '/orders', handlerType: 'BusinessAction', parameters: [{name: 'id', in: 'query', schema: {type: ['string', 'null'], default: null}}], requestBody: {content: {'application/json': {schema: {type: 'object', properties: {amount: {type: 'number', minimum: 0}}}}}}, responses: {'200': {description: '成功', content: {'application/json': {schema: {$ref: '#/components/schemas/Order'}}}}}, security: [{bearer: []}], servers: [{url: 'https://{host}', variables: {host: {default: 'example.com', enum: ['example.com']}}}]}],
  ['notification', {name: 'orderCreated', title: '订单已创建', channel: {sms: {templateId: 'order'}}, payloadSchema: {type: 'object'}}],
  ['business-log', {name: 'createOrder', httpMethod: 'POST', url: '/orders', sensitiveFields: ['token'], shouldSaveResponseBody: null}],
  ['data-init', {id: 'seed', blocks: [{id: 'orders', targetModel: 'order', matchFields: ['id'], records: [{id: '1', amount: 20}]}]}],
  ['mq', {bindingType: 'consumer', bindingName: 'orders', destination: 'orders', flowName: 'consumeOrder'}],
  ['schedule', {name: 'cleanup', cron: '0 0 * * * ?', flowName: 'cleanupOrders', data: {days: 30}}],
  ['i18n', {locale: 'zh-CN', name: '简体中文', direction: 'LTR', messages: {common: {save: '保存'}}}],
  ['data-dict', {name: 'departments', title: '部门', type: 'string', treeMode: true, multiTenant: true, items: [{code: 'root', label: '总部', children: [{code: 'sales', label: '销售', parent: 'root'}]}]}],
  ['position', {key: 'manager', name: '主管', level: 'L1'}],
  ['error-code', [{code: 40001, title: '订单不存在', defaultMessageTemplate: '找不到订单 ${id}'}]],
  ['app-metadata', {name: 'crm', defaultTheme: 'dark', custom: {loginMicroWeb: null, topBarMicroWeb: 'header'}}],
  ['modules-diff', [{diffType: 'modify', fullName: 'orders', parent: null, order: null, subMenus: null}]],
  ['app-module', [{fullName: 'orders', title: '订单', parent: 'sales', authorities: ['orders.read']}]],
  ['configuration', [configuration]],
  ['configuration-group', [group]],
  ['configuration-item', configuration],
  ['configuration-group-item', group],
]

function validate(type, resource) {
  const validator = validators.get(type)
  const valid = validator(resource)
  return {valid, errors: validator.errors}
}

describe('metadata resource contracts', () => {
  test.each(validResources)('%s accepts a current resource', (type, resource) => {
    const result = validate(type, resource)
    expect(result.valid, JSON.stringify(result.errors)).toBe(true)
  })

  test.each([
    ['approval-workflow', {flowDefinition: workflow}],
    ['approval-workflow', {name: 'leave', label: '请假', form: {formType: 'dynamicForm', formKey: 'leave'}, editorLayout: []}],
    ['approval-workflow', {...workflow, nodes: [{type: 'ApprovalNode', subType: '会签', candidates: [{type: 'UserSelect', mode: 'single', candidateRange: 'ROLE'}]}]}],
    ['business', {...business, modelType: 'custom-plugin', pluginConfig: {enabled: true}}],
    ['business', {...business, formatVersion: '0.1'}],
    ['business', {...business, formatVersion: '1.0'}],
    ['business', {modelType: 'dashboard', name: 'metrics', title: '指标', formatVersion: 'vendor-3'}],
    ['business', {modelType: 'composite-view', name: 'orders', title: '订单视图', columns: [{field: 'amount', width: 100}], layoutConfig: {defaultSort: [{field: 'amount', direction: 'desc'}]}}],
    ['business', {modelType: 'dashboard', name: 'sales', title: '销售看板', widgets: [{id: 'orders', widgetName: 'table', size: {cols: 6, rows: 3}}]}],
    ['configuration-item', {...configuration, defaultValue: {pageSize: 20}}],
    ['configuration-item', {...configuration, defaultValue: null}],
    ['data-init', {id: 'seed', version: null, blocks: [{id: 'orders', targetModel: 'order', version: null, matchFields: ['id', 'id']}]}],
    ['ui-schema', [{type: 'input-text', name: 'name'}]],
  ])('%s preserves defaults, aliases and extension formats', (type, resource) => {
    const result = validate(type, resource)
    expect(result.valid, JSON.stringify(result.errors)).toBe(true)
  })

  test.each([
    ['authority', 'delegable type', {fullName: 'orders.read', title: '查看', delegable: 'yes'}],
    ['authority', 'controlled field type', {fullName: 'orders.read', title: '查看', accessControlDefine: {controlledFields: [{name: 1}]}}],
    ['dev-menu', 'nested show mode', {fullName: 'models', title: '模型', children: [{fullName: 'order', title: '订单', showMode: 'popup'}]}],
    ['business', 'field definition type', {...business, fields: [{name: 'amount', type: 1}]}],
    ['business', 'unknown default model version', {...business, formatVersion: '3.0'}],
    ['business', 'numeric default model version', {...business, formatVersion: 2.0}],
    ['business', 'null default model version', {...business, formatVersion: null}],
    ['business', 'binding kind', {...business, actions: [{name: 'submit', binding: {kind: 'unknown'}}]}],
    ['business', 'enabled action binding', {...business, actions: [{name: 'submit', isEnabled: true}]}],
    ['business', 'logicflow binding target', {...business, actions: [{name: 'submit', binding: {kind: 'logicflow'}}]}],
    ['business', 'event producers', {...business, events: [{name: 'submitted', occurrenceCondition: '提交成功', subject: 'model', allowedProducerKinds: []}]}],
    ['business', 'subscription target exclusivity', {...business, eventSubscriptions: [{...business.eventSubscriptions[0], targetActionModelFullName: 'order', targetActionName: 'submit'}]}],
    ['business', 'dashboard widget size', {modelType: 'dashboard', name: 'sales', title: '销售', widgets: [{size: {cols: 'wide'}}]}],
    ['logicflow', 'connection port index', {name: 'flow', connections: [{sourceOutputPort: 'first'}]}],
    ['logicflow', 'node position', {name: 'flow', nodePositions: {start: {x: 'left'}}}],
    ['logicflow', 'nested port list', {name: 'flow', nodes: [{inputPorts: {}}]}],
    ['approval-workflow', 'static format version', {...workflow, formatVersion: 2}],
    ['approval-workflow', 'positive version', {...workflow, version: 0}],
    ['approval-workflow', 'form binding', {...workflow, form: {formType: 'dynamicForm'}}],
    ['approval-workflow', 'edge type', {...workflow, edges: [{type: 'sequence'}]}],
    ['approval-workflow', 'approval subtype', {...workflow, nodes: [{type: 'ApprovalNode', subType: 'unknown'}]}],
    ['field-type', 'parameter form item', {name: 'code', label: '编码', paramsUiSchema: [1]}],
    ['flow-node', 'SVG map value', {type: 'Node', label: '节点', svgs: {icon: 1}}],
    ['widget', 'grid size', {name: 'table', title: '表格', defaultSize: {cols: 'wide'}}],
    ['webapi', 'parameter location', {method: 'GET', path: '/orders', parameters: [{in: 'body'}]}],
    ['webapi', 'response body', {method: 'GET', path: '/orders', responses: {'200': 'OK'}}],
    ['webapi', 'security scopes', {method: 'GET', path: '/orders', security: [{bearer: 'read'}]}],
    ['data-init', 'empty blocks', {id: 'seed', blocks: []}],
    ['data-init', 'blank identifier', {id: ' ', blocks: [{id: 'orders', targetModel: 'order', matchFields: ['id']}]}],
    ['data-init', 'empty match fields', {id: 'seed', blocks: [{id: 'orders', targetModel: 'order', matchFields: []}]}],
    ['data-init', 'record object', {id: 'seed', blocks: [{id: 'orders', targetModel: 'order', matchFields: ['id'], records: [1]}]}],
    ['data-dict', 'recursive item code', {name: 'd', title: '字典', type: 'string', treeMode: true, items: [{code: 'a', label: 'A', children: [{code: 1, label: 'B'}]}]}],
    ['i18n', 'namespaced message values', {locale: 'zh-CN', name: '中文', messages: {common: {save: {text: '保存'}}}}],
    ['position', 'string level', {key: 'manager', name: '主管', level: 1}],
    ['configuration', 'array root', configuration],
    ['configuration-item', 'single object root', [configuration]],
  ])('%s rejects invalid %s', (type, _case, resource) => {
    expect(validate(type, resource).valid).toBe(false)
  })
})
