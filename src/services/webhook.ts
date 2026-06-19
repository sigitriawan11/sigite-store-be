import { DigiflazzService } from "./digiflazz";
import { TransactionRepository } from "../repositories/transaction";
import { WSService } from "./websocket";

export class WebhookService {
  







  static async handleXenditCallback(payload: any) {
    console.log("Xendit Callback received:", JSON.stringify(payload, null, 2));

    const event = payload.event;
    const data = payload.data || payload;

    let ref_id: string | null = null;
    let xenditStatus: string | undefined;

    if (data.reference_id) {
      ref_id = data.reference_id;
    } else if (data.external_id) {
      ref_id = data.external_id;
    }

    if (event === 'payment_request.paid' || event === 'invoice.paid') {
      xenditStatus = 'PAID';
    } else if (data.status === 'COMPLETED' || data.status === 'SUCCEEDED') {
      xenditStatus = 'PAID';
    } else if (data.status === 'FAILED' || data.status === 'VOIDED' || data.status === 'EXPIRED') {
      xenditStatus = 'FAILED';
    }

    if (!ref_id || !xenditStatus) {
      console.log("Xendit webhook ignored: missing ref_id or unrecognized event");
      return { received: true, processed: false, reason: "ignored" };
    }

    const transaction = await TransactionRepository.findByRefId(ref_id);
    if (!transaction) {
      console.log(`Transaction ${ref_id} not found in DB, ignoring`);
      return { received: true, processed: false, reason: "not_found" };
    }

    
    if (transaction.status !== 'PENDING') {
      console.log(`Transaction ${ref_id} already processed (status=${transaction.status}), skipping`);
      return { received: true, processed: false, reason: `already_${transaction.status}` };
    }

    if (xenditStatus === 'PAID') {
      
      const paidAt = new Date();
      await TransactionRepository.updateStatus(ref_id, 'PAID', {
        paid_at: paidAt,
        status_provider: 'Process',
      });

      console.log(`Transaction ${ref_id} marked as PAID. Sending to Digiflazz...`);

      
      WSService.broadcast(ref_id, {
        status: 'PAID',
        status_provider: 'Process',
        paid_at: paidAt.toISOString(),
      });

      
      
      try {
        const accountData = transaction.account_data || {};
        const customerNo = (accountData as any).customer_no || transaction.phone;

        const digiflazzResult = await DigiflazzService.createTransaction({
          ref_id: transaction.ref_id,
          product_code: transaction.product_code,
          customer_no: customerNo,
        });

        console.log(`Digiflazz topup sent for ${ref_id}:`, digiflazzResult);
      } catch (error: any) {
        console.error(`Digiflazz topup failed for ${ref_id}:`, error.message);
        
        
      }
    } else if (xenditStatus === 'FAILED') {
      await TransactionRepository.updateStatus(ref_id, 'FAILED');
      console.log(`Transaction ${ref_id} marked as FAILED`);
      WSService.broadcast(ref_id, { status: 'FAILED' });
    }

    return {
      received: true,
      processed: true,
      ref_id,
      new_status: xenditStatus,
    };
  }

  
















  static async handleDigiflazzCallback(payload: any) {
    console.log("Digiflazz Callback received:", JSON.stringify(payload, null, 2));

    
    const data = payload?.data || payload;

    const ref_id = data?.ref_id;
    if (!ref_id) {
      console.log("Digiflazz webhook ignored: no ref_id");
      return { received: true, processed: false, reason: "no_ref_id" };
    }

    const transaction = await TransactionRepository.findByRefId(ref_id);
    if (!transaction) {
      console.log(`Transaction ${ref_id} not found, ignoring Digiflazz webhook`);
      return { received: true, processed: false, reason: "not_found" };
    }

    
    if (transaction.status !== 'PAID') {
      console.log(`Transaction ${ref_id} status is ${transaction.status}, ignoring Digiflazz webhook`);
      return { received: true, processed: false, reason: `status_${transaction.status}` };
    }

    
    const digiflazzStatus = (data.status || '').trim().toLowerCase();
    let providerStatus: string;

    switch (digiflazzStatus) {
      case 'sukses':
      case 'success':
        providerStatus = 'Success';
        break;
      case 'gagal':
      case 'failed':
        providerStatus = 'Failed';
        break;
      default:
        providerStatus = 'Process';
        break;
    }

    await TransactionRepository.updateStatus(ref_id, 'PAID', {
      status_provider: providerStatus,
    });

    console.log(`Transaction ${ref_id} provider status updated to ${providerStatus} via Digiflazz webhook`);

    
    WSService.broadcast(ref_id, {
      status: 'PAID',
      status_provider: providerStatus,
    });

    return {
      received: true,
      processed: true,
      ref_id,
      provider_status: providerStatus,
    };
  }
}