'use strict';
const Payment = require('../models').Payment;
const ClientGroup = require('../models').ClientGroup;
const Client = require('../models').Client;
const Group = require('../models').Group;
const Course = require('../models').Course;
const ClientController = require('./ClientController');
const paymentPDF = require('../utils/PaymentsListPDF');
const PaymentController = {};
const clientInfo = {model: ClientGroup,attributes:['client_id'],include:[{model:Client,attributes:['id','name']},
                                                                        {model:Group,attributes:['id'], include:{model:Course}}]}
const normalizePaymentObject = (payment) => {
    payment['client_id'] = payment.ClientGroup.Client.id;
    payment['name'] = payment.ClientGroup.Client.name;
    payment['course'] = payment.ClientGroup.Group.Course.name;    
    delete payment.ClientGroup;
    return payment;
}

const normalizeAllPayments = (payments) => {
    payments.rows = payments.rows.map(item => item.toJSON())
                            .map(normalizePaymentObject);
    return payments;
}

/*Payment.findAndCountAll({ include:{model: ClientGroup,attributes:['client_id'],include:{model:Client,attributes:['id','name']}}})
    .then(normalizeAllPayments)*/

PaymentController.getAll = ({filter,limit,offset, onlyPending}) => {
//filter? 
//Payment.findAndCountAll({where:{name:{$ilike:'%'+filter+'%'}},limit,offset,order:'due_date',include:clientInfo}).then(normalizeAllPayments) : 

    let opt = {
        limit,
        offset,
        order:'due_date',
        include:clientInfo
    };
    onlyPending = onlyPending == 'true'
    if(onlyPending) opt['where'] = {paid:false};
    return Payment.findAndCountAll(opt).then(normalizeAllPayments);
}
PaymentController.get = (clientGroup_id, installment) => Payment.findOne( {where:{clientGroup_id, installment}} );
PaymentController.getFromClient = (client_id) => Payment.findAll({
    include: {model:ClientGroup, where:{client_id}, attributes: []}
});
PaymentController.getFromGroup = (group_id) => Payment.findAll({
    include: {model:ClientGroup, where:{group_id}, attributes: []}
});
PaymentController.create = (payment) => Payment.create(payment);
PaymentController.delete = (id) => Payment.destroy({where:{id:id}});

PaymentController.generateReceiptForStudent = async (student_id, month) => {
    let cli = await ClientController.getWithPayments(student_id,month)
    if (!cli) throw require('boom').notFound(`No Payments for this month`);
    cli = cli.get({plain:true})
    let clientPayments = cli.ClientGroups.map( cg => {
        let aux = cg.Payments.map( p => {
            p.Group = cg.Group
            return p;
        });
        return aux;
        
    });
    cli.Payments = require('lodash').cloneDeep([].concat(...clientPayments));
    delete cli.ClientGroups;
    delete cli.Group;
    return paymentPDF(cli);
}

PaymentController.pay = async (clientGroup_id, installment) => {
    try{
        let payment = await Payment.findOne( {where:{clientGroup_id, installment}} );
        if ( !payment ) throw require('boom').notFound(`No payment found`);
        await payment.update({paid:true});
    }catch (e) {
        throw e;
    }
}


module.exports = PaymentController;
