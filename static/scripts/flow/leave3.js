var jsondata = {
    "title": "请假流程",
    "nodes": {
        "demo_node_48": {
            "name": "请假申请",
            "left": 50,
            "top": 39,
            "type": "start round",
            "width": 24,
            "height": 24,
            "alt": true
        },
        "demo_node_53": {
            "name": "部门经理审批",
            "left": 196,
            "top": 18,
            "type": "chat",
            "width": 126,
            "height": 73,
            "alt": true
        },
        "demo_node_54": {
            "name": "行政审批",
            "left": 817,
            "top": 189,
            "type": "chat",
            "width": 127,
            "height": 84,
            "alt": true
        },
        "demo_node_55": {
            "name": "总经理审批",
            "left": 506,
            "top": 191,
            "type": "chat",
            "width": 122,
            "height": 78,
            "alt": true
        },
        "demo_node_75": {
            "name": "通过审批",
            "left": 1070,
            "top": 214,
            "type": "end round",
            "width": 24,
            "height": 24,
            "alt": true
        },
        "demo_node_83": {
            "name": "同意，分支判断",
            "left": 512,
            "top": 41,
            "type": "fork",
            "width": 100,
            "height": 40,
            "alt": true
        },
        "demo_node_84": {
            "name": "未通过审批",
            "left": 554,
            "top": 481,
            "type": "end round",
            "width": 24,
            "height": 24,
            "alt": true
        }
    },
    "lines": {
        "demo_line_56": {
            "type": "sl",
            "from": "demo_node_48",
            "to": "demo_node_53",
            "name": "上报",
            "alt": true
        },
        "demo_line_66": {
            "type": "lr",
            "M": 869.25,
            "from": "demo_node_83",
            "to": "demo_node_54",
            "name": "小于3天"
        },
        "demo_line_67": {
            "type": "sl",
            "from": "demo_node_83",
            "to": "demo_node_55",
            "name": "大于3天"
        },
        "demo_line_68": {
            "type": "sl",
            "from": "demo_node_55",
            "to": "demo_node_54",
            "name": "同意"
        },
        "demo_line_69": {
            "type": "tb",
            "M": 493.25,
            "from": "demo_node_54",
            "to": "demo_node_84",
            "name": "不同意"
        },
        "demo_line_72": {
            "type": "sl",
            "from": "demo_node_53",
            "to": "demo_node_83",
            "name": ""
        },
        "demo_line_73": {
            "type": "lr",
            "M": 257.5,
            "from": "demo_node_53",
            "to": "demo_node_84",
            "name": "不同意"
        },
        "demo_line_74": {
            "type": "sl",
            "from": "demo_node_55",
            "to": "demo_node_84",
            "name": "不同意"
        },
        "demo_line_76": {
            "type": "sl",
            "from": "demo_node_54",
            "to": "demo_node_75",
            "name": "同意"
        }
    },
    "areas": {},
    "initNum": 85
}