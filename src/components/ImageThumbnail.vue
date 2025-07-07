<template>
  <div class="thumbnail-container">
    <!-- 缩略图列:-->
    <div class="thumbnail-list">
      <div
        v-for="(image, index) in visibleImages"
        :key="index"
        class="thumbnail"
        @click="showImage(image.filePath)"
      >
        <!-- 使用 filePath 加载缩略:-->
        <img :src="image.filePath" alt="Thumbnail" class="lazy-load" />
        <!-- 添加文件名显:-->
        <div class="thumbnail-filename">{{ image.fileName }}</div>
      </div>
    </div>

    <!-- 分页按钮 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一</button>
      <span>?{{ currentPage }} :/ :{{ totalPages }} :</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一</button>
    </div>

    <!-- 全屏覆盖:-->
    <div class="fullscreen-overlay" v-if="selectedImage" >
      <div class="fullscreen-image-container">
        <!-- 全屏显示大图 -->
        <img :src="selectedImage" alt="Selected Image" class="fullscreen-image" />

        <!-- 添加关闭按钮 -->
        <button class="close-button" @click="closeImage">X</button>

        <!-- 添加上一张和下一张按:-->
        <button class="prev-button" @click="prevImage" :disabled="currentImageIndex <= 0">上一</button>
        <button class="next-button" @click="nextImage" :disabled="currentImageIndex >= images.length - 1">下一</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImageThumbnail",
  props: {
    images: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedImage: null, // 当前选中的大图路径
      currentPage: 1, // 当前页码
      itemsPerPage: 20, // 每页显示的图像数
      currentImageIndex: -1, // 当前选中的图像索引
    };
  },
  created() {
    this.currentPage = 1;
    this.selectedImage = null;
  },
  computed: {
    visibleImages() {
      // 确保 this.images 是一个数组
      if (!Array.isArray(this.images)) {
        return [];
      }

      // 计算当前页显示的图像
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.images.slice(start, end);
    },
    totalPages() {
      // 确保 this.images 是一个数组
      if (!Array.isArray(this.images)) {
        return 0;
      }

      // 计算总页数
      return Math.ceil(this.images.length / this.itemsPerPage);
    },
  },
  methods: {
    clearFormData() {
      this.currentPage = 1;
      this.selectedImage = null;
      this.currentImageIndex = -1;
      console.log("===clearFormData===");
    },
    showImage(filePath) {
      // 设置当前选中的大图路径
      this.selectedImage = filePath;
      // 找到当前选中的图像索引
      this.currentImageIndex = this.images.findIndex((img) => img.filePath === filePath);
      console.log(`Showing image: ${filePath}, Index: ${this.currentImageIndex}`);
    },
    closeImage() {
      // 关闭全屏显示
      this.selectedImage = null;
      this.currentImageIndex = -1;
      console.log("Closing image");
    },
    nextPage() {
      /**
       * 下一页 */
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      /**
       * 上一页 */
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    prevImage() {
      /**
       * 显示上一张图片 */
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
        this.selectedImage = this.images[this.currentImageIndex].filePath;
        console.log(`Switched to previous image: ${this.selectedImage}, Index: ${this.currentImageIndex}`);
      }
    },
    nextImage() {
      /**
       * 显示下一张图片 */
      if (this.currentImageIndex < this.images.length - 1) {
        this.currentImageIndex++;
        this.selectedImage = this.images[this.currentImageIndex].filePath;
        console.log(`Switched to next image: ${this.selectedImage}, Index: ${this.currentImageIndex}`);
      }
    },
  },
};
</script>

<style scoped>
.thumbnail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 300px;
}

.thumbnail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumbnail img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #ccc;
  border-radius: 5px;
}

.thumbnail-filename {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination button {
  margin: 0 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 全屏覆盖层样式 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.fullscreen-image-container {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* 使子元素可以绝对定位 */
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* 关闭按钮样式 */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 上一张和下一张按钮样式 */
.prev-button,
.next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.prev-button {
  left: 10px;
}

.next-button {
  right: 10px;
}

.prev-button:disabled,
.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
