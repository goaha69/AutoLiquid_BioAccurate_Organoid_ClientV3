<template>
  <div v-if="node.type == 'start round mix'"
    :id="node.id"
    class="common-circle-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
    cursor: currentTool.type == 'drag' ? 'move' : (currentTool.type == 'connection' ? 'crosshair' :
    																								(currentTool.type == 'zoom-in' ? 'zoom-in' :
    																								(currentTool.type == 'zoom-out' ? 'zoom-out' : 'default'))),
    background: verificationStyle[!!activityId ? '1' : '4'] }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu">
    <a-icon type="play-circle" />
    {{ node.name }}
  </div>

  <div v-else-if="node.type == 'end round'"
    :id="node.id"
    class="common-circle-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
    cursor: currentTool.type == 'drag' ? 'move' : (currentTool.type == 'connection' ? 'crosshair' :
    																								(currentTool.type == 'zoom-in' ? 'zoom-in' :
    																								(currentTool.type == 'zoom-out' ? 'zoom-out' : 'default'))),
    background: verificationStyle[!!activityId && activityId == node.id ? '0' : (!!node.setInfo && !!node.setInfo.Taged ? node.setInfo.Taged.toString() : '4')] }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu">
    <a-icon type="close-circle" />
    {{ node.name }}
  </div>

  <div v-else-if="node.type == 'node'"
        :id="node.id"
        class="common-rectangle-node"
        :class="{ active: isActive() }"
        :style="{ top: node.y + 'px', left: node.x + 'px',
                    cursor: currentTool.type == 'drag' ? 'move' : (currentTool.type == 'connection' ? 'crosshair' :
                                                                                    (currentTool.type == 'zoom-in' ? 'zoom-in' :
                                                                                    (currentTool.type == 'zoom-out' ? 'zoom-out' : 'default'))),
        background: verificationStyle[!!activityId && activityId == node.id ? '0' : (!!node.setInfo && !!node.setInfo.Taged ? node.setInfo.Taged.toString() : '4')] }"
        @click.stop="selectNode"
        @contextmenu.stop="showNodeContextMenu">
            <a-icon type="setting" />
            {{ node.name }}
    </div>

    <div v-else-if="node.type == 'fork'"
        :id="node.id"
        class="common-rectangle-node"
        :class="{ active: isActive() }"
        :style="{ top: node.y + 'px', left: node.x + 'px',
                    cursor: currentTool.type == 'drag' ? 'move' : (currentTool.type == 'connection' ? 'crosshair' :
                                                                                    (currentTool.type == 'zoom-in' ? 'zoom-in' :
                                                                                    (currentTool.type == 'zoom-out' ? 'zoom-out' : 'default'))),
        background: verificationStyle[!!activityId && activityId == node.id ? '0' : (!!node.setInfo && !!node.setInfo.Taged ? node.setInfo.Taged.toString() : '4')] }"
        @click.stop="selectNode"
        @contextmenu.stop="showNodeContextMenu">
                    <a-icon type="fullscreen" />
                    {{ node.name }}
    </div>

    <div v-else-if="node.type == 'join'"
        :id="node.id"
        class="common-rectangle-node"
        :class="{ active: isActive() }"
        :style="{ top: node.y + 'px', left: node.x + 'px',
                    cursor: currentTool.type == 'drag' ? 'move' : (currentTool.type == 'connection' ? 'crosshair' :
                                                                                    (currentTool.type == 'zoom-in' ? 'zoom-in' :
                                                                                    (currentTool.type == 'zoom-out' ? 'zoom-out' : 'default'))),
        background: verificationStyle[!!activityId && activityId == node.id ? '0' : (!!node.setInfo && !!node.setInfo.Taged ? node.setInfo.Taged.toString() : '4')] }"
        @click.stop="selectNode"
        @contextmenu.stop="showNodeContextMenu">
        <a-icon type="fullscreen-exit" />
      {{ node.name }}
    </div>

    <div v-else-if="node.type == 'x-lane'"
        :id="node.id"
        class="common-x-lane-node"
        :class="{ active: isActive() }"
        :style="{ top: node.y + 'px', left: node.x + 'px', height: node.height + 'px', width: node.width + 'px',
                    cursor: currentTool.type == 'zoom-in' ? 'zoom-in' : (currentTool.type == 'zoom-out' ? 'zoom-out' : 'default') }">
            <div class="lane-text-div"
                    :style="{ cursor: currentTool.type == 'drag' ? 'move' : 'default' }"
                    @click.stop="selectNode"
                    @contextmenu.stop="showNodeContextMenu">
                    <span class="lane-text">{{ node.name }}</span>
            </div>
    </div>

    <div v-else-if="node.type == 'y-lane'"
        :id="node.id"
        class="common-y-lane-node"
        :class="{ active: isActive() }"
        :style="{ top: node.y + 'px', left: node.x + 'px', height: node.height + 'px', width: node.width + 'px',
                    cursor: currentTool.type == 'zoom-in' ? 'zoom-in' : (currentTool.type == 'zoom-out' ? 'zoom-out' : 'default') }">
            <div class="lane-text-div"
                    :style="{ cursor: currentTool.type == 'drag' ? 'move' : 'default' }"
                    @click.stop="selectNode"
                    @contextmenu.stop="showNodeContextMenu">
                    <span class="lane-text">{{ node.name }}</span>
            </div>
    </div>

  <div v-else></div>
</template>


<script>
	import jsplumb from 'jsplumb'
	import { flowConfig } from '../config/args-config.js'
	import $ from 'jquery'
	// import $ from 'jquery-ui/node_modules/jquery/dist/jquery'
	import 'jquery-ui/ui/widgets/draggable'
	import 'jquery-ui/ui/widgets/droppable'
	import 'jquery-ui/ui/widgets/resizable'
	import { ZFSN } from '../util/ZFSN.js'

	export default {
		props: ['select', 'selectGroup', 'node', 'plumb', 'currentTool','activityId'],
		components: {
			jsplumb
		},
		mounted () {
			this.registerNode();
		},
		data () {
			return {
				currentSelect: this.select,
				currentSelectGroup: this.selectGroup,
        		verificationStyle:flowConfig.verificationStyle
                          
			}
		},
		methods: {
			registerNode () {
				const that = this;
				that.plumb.draggable(that.node.id, {
					containment: 'parent',
					handle: function(e, el) {
						var possibles = el.parentNode.querySelectorAll('.common-circle-node,.common-rectangle-node,.common-diamond-node,.lane-text-div');
		        for (var i = 0; i < possibles.length; i++) {
	            if (possibles[i] === el || e.target.className == 'lane-text') return true;
		        }
		        return false;
					},
					grid: flowConfig.defaultStyle.alignGridPX,
					drag: function(e) {
						if (flowConfig.defaultStyle.isOpenAuxiliaryLine) {
							that.$emit('alignForLine', e);
						}
					},
					stop: function(e) {
						that.node.x = e.pos[0];
						that.node.y = e.pos[1];
						if (that.currentSelectGroup.length > 1) {
							that.$emit('updateNodePos');
						}
						that.$emit('hideAlignLine');
					}
				});

				if (that.node.type == 'x-lane' || that.node.type == 'y-lane') {
					$('#' + that.node.id).resizable({
						minHeight: 200,
						minWidth: 200,
						maxHeight: 2000,
						maxWidth: 2000,
						stop: function(event, ui) {
							that.node.height = ui.size.height;
							that.node.width = ui.size.width;
						}
					});
				}
				that.currentSelect = that.node;
				that.currentSelectGroup = [];
			},
			selectNode () {
				const that = this;
				that.currentSelect = this.node;
				that.$emit('isMultiple', flag => {
					if (!flag) {
						that.currentSelectGroup = [];
					} else {
						let f = that.currentSelectGroup.filter(s => s.id == that.node.id);
						if (f.length <= 0) {
							that.plumb.addToDragSelection(that.node.id);
							that.currentSelectGroup.push(that.node);
						}
					}
				});
			},
			showNodeContextMenu (e) {
				this.$emit('showNodeContextMenu', e);
				this.selectNode();
			},
			isActive () {
				const that = this;
				if (that.currentSelect.id == that.node.id) return true;
				let f = that.currentSelectGroup.filter(n => n.id == that.node.id);
				if (f.length > 0) return true;
				return false;
			}
		},
		watch: {
			select (val) {
				this.currentSelect = val;
			},
			currentSelect: {
				handler (val) {
					this.$emit('update:select', val);
				},
				deep: true
			},
			selectGroup (val) {
				this.currentSelectGroup = val;
			},
			currentSelectGroup: {
				handler (val) {
					this.$emit('update:selectGroup', val);
				},
				deep: true
			}
		}
	}
</script>

<style lang="less" scoped>
	@import '../style/flow-node.less';
</style>
