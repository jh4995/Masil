// lib/screens/finder_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class FinderScreen extends StatefulWidget {
  final String meetingCode;
  const FinderScreen({super.key, required this.meetingCode});

  @override
  State<FinderScreen> createState() => _FinderScreenState();
}

class _FinderScreenState extends State<FinderScreen> {
  String _status = '모임 정보를 찾는 중...';
  String? _targetUuid;
  StreamSubscription? _scanSubscription;
  Timer? _restartTimer; // 주기적으로 스캔을 재시작할 타이머
  int _rssi = -100;

  @override
  void initState() {
    super.initState();
    // 1. 화면이 시작되면 즉시 첫 스캔을 실행합니다.
    _initializeAndStartScanning();

    // 2. ⬇️ FIX: 5초마다 스캔을 재시작하는 타이머를 설정합니다.
    _restartTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      print("--- 5초 경과: 스캔을 재시작합니다. ---");
      _initializeAndStartScanning();
    });
  }

  @override
  void dispose() {
    // 3. ⬇️ FIX: 화면이 꺼지면 타이머를 반드시 취소합니다.
    _restartTimer?.cancel();
    _scanSubscription?.cancel();
    FlutterBluePlus.stopScan();
    super.dispose();
  }

  Future<void> _initializeAndStartScanning() async {
    // 이 함수는 이전과 동일합니다.
    try {
      if (_targetUuid == null) {
        final doc = await FirebaseFirestore.instance
            .collection('meetings')
            .doc(widget.meetingCode)
            .get();

        if (!doc.exists) {
          if(mounted) setState(() => _status = '잘못된 모임 코드입니다.');
          _restartTimer?.cancel(); // 잘못된 코드면 타이머도 중지
          return;
        }
        _targetUuid = doc.data()!['beacon_uuid']?.toLowerCase();
      }
      
      await _scanSubscription?.cancel();
      await FlutterBluePlus.stopScan();

      if(mounted) setState(() => _status = '비콘을 찾는 중...');
      
      _scanSubscription = FlutterBluePlus.onScanResults.listen((results) {
        for (ScanResult r in results) {
          if (r.advertisementData.serviceUuids
              .any((uuid) => uuid.toString().toLowerCase() == _targetUuid)) {
            if (_rssi != r.rssi) {
              print('${DateTime.now()}: Correct Beacon Found! NEW RSSI: ${r.rssi}');
              if(mounted) {
                setState(() {
                  _rssi = r.rssi;
                  _status = '비콘 발견!';
                });
              }
            }
            return;
          }
        }
      });

      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 4),
        androidScanMode: AndroidScanMode.lowLatency,
      );
    } catch (e) {
      if(mounted) setState(() => _status = '오류 발생: $e');
    }
  }

  // build 메소드와 getDistanceText 함수는 이전과 동일합니다.
  @override
  Widget build(BuildContext context) {
    final double circleSize = 300 * (1 - (_rssi.abs() / 100.0) * 0.8);
    return Scaffold(
      appBar: AppBar(title: Text('${widget.meetingCode} 모임 참가 중')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 800),
              curve: Curves.elasticOut,
              width: circleSize.clamp(50, 300),
              height: circleSize.clamp(50, 300),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.4),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blue.withOpacity(0.6), width: 4),
              ),
            ),
            const SizedBox(height: 40),
            Text(_status, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            if (_rssi > -100)
              Column(
                children: [
                  Text(
                    _getDistanceText(_rssi),
                    style: Theme.of(context)
                        .textTheme
                        .displaySmall
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '신호 세기: $_rssi dBm',
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.grey[600]),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _getDistanceText(int rssi) {
    if (rssi > -65) return '바로 앞에 있어요!';
    if (rssi > -75) return '가까워요';
    if (rssi > -85) return '근처에 있어요';
    return '멀리 있어요';
  }
}