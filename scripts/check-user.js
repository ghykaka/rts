const cloud = require('wx-server-sdk');
cloud.init({ env: 'liandaofutou-2gdayw0068d938b3' });

const db = cloud.database();

exports.main = async (event, context) => {
  const userId = '7a85e5d469d11ac8002a69ac69722904';
  
  // 查询用户信息
  const userRes = await db.collection('users').doc(userId).get();
  console.log('User info:', JSON.stringify(userRes.data));
  
  // 查询子账号
  const subRes = await db.collection('enterprise_sub_accounts')
    .where({ user_id: userId })
    .get();
  console.log('Sub accounts:', JSON.stringify(subRes.data));
  
  return {
    user: userRes.data,
    subAccounts: subRes.data
  };
};
