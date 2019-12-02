const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (app.userInfo._id) {
      /*
      db.collection('project').where({
        userId: app.userInfo._id
      }).get().then((res) => {
        if (res.data.length) { // 更新
          if (res.data[0].list.includes(app.userInfo._id)) {
            wx.showToast({
              title: '已经创建过!'
            })
          } else {
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'project',
                where: {
                  userId: app.userInfo._id
                },
                data: `{list : _.unshift('${app.userInfo._id}')}`,
                projectname: e.detail.value.input,
                isHide: e.detail.value.switch

              }
            }).then((res) => {
              

                wx.showToast({
                  title: '更新成功'
             
              })
            });
          }
        //} 
        else { 
          */
          // 添加 
          db.collection('project').add({
            data: {
              userId: app.userInfo._id,
              list: [app.userInfo._id],
              projectname: e.detail.value.input,
              isHide: e.detail.value.switch,
              TeamList: [app.userInfo._id]
            }
          }).then((res) => {
            console.log(res)
            db.collection('users').doc(app.userInfo._id)
          .update({

              data: {
                joinList: _.unshift(res._id)
              }
            }).then((res) => {

              wx.showToast({
                title: '创建成功'
              })
            })
          });
      //  }
     // });
    }

     else {
      wx.showToast({
        title: '请先登录',
        duration: 2000,
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user'
            })
          }, 2000);
        }
      })
    }



  },
  formReset: function() {
    console.log('form发生了reset事件')
  },
  deleteProject() {
    if (app.userInfo._id) {
      db.collection('project').where({
        userId: app.userInfo._id
      }).get().then((res) => {
        if (res.data.length) { // 更新
          if (res.data[0].list.includes(app.userInfo._id)) {
            //删除
            wx.cloud.callFunction({
              name: 'remove',
              data: {
                collection: 'project',
                where: {
                  userId: app.userInfo._id
                }
              }
            }).then((res) => {
              wx.showToast({
                title: '删除成功~'
              })
            });
          } else {
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'project',
                where: {
                  userId: app.userInfo._id
                },
                data: `{list : _.unshift('${app.userInfo._id}')}`

              }
            }).then((res) => {
              wx.showToast({
                title: '创建成功~'
              })
            });
          }
        } else { // 添加 
          db.collection('project').add({
            data: {
              userId: app.userInfo._id,
              list: [app.userInfo._id],
              projectname: e.detail.value.input,
              isHide: e.detail.value.switch
            }
          }).then((res) => {
            wx.showToast({
              title: '创建成功'
            })
          });
        }
      });
    } else {
      wx.showToast({
        title: '请先登录',
        duration: 2000,
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user'
            })
          }, 2000);
        }
      })
    }
  }
})